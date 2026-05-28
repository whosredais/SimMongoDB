"""
SimMongo Edu — Backend
Fully in-memory MongoDB cluster simulator with FastAPI.
"""

import hashlib
import uuid
from enum import Enum
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# ──────────────────────────────────────────────
#  Enums
# ──────────────────────────────────────────────

class NodeRole(str, Enum):
    PRIMARY = "primary"
    SECONDARY = "secondary"


class NodeStatus(str, Enum):
    ALIVE = "alive"
    DEAD = "dead"


class ShardingStrategy(str, Enum):
    HASHED = "hashed"
    RANGED = "ranged"


# ──────────────────────────────────────────────
#  Domain Models (pure Python, not Pydantic)
# ──────────────────────────────────────────────

class Node:
    """Represents a single mongod instance."""

    def __init__(self, node_id: str, role: NodeRole, shard_id: str):
        self.id = node_id
        self.role = role
        self.status = NodeStatus.ALIVE
        self.shard_id = shard_id
        self.data: list[dict] = []

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "role": self.role.value,
            "status": self.status.value,
            "shard_id": self.shard_id,
            "doc_count": len(self.data),
            "data": self.data,
        }


class ReplicaSet:
    """A replica set: 1 primary + N secondaries."""

    def __init__(self, shard_id: str, num_secondaries: int):
        self.shard_id = shard_id
        self.primary = Node(
            node_id=f"{shard_id}-primary",
            role=NodeRole.PRIMARY,
            shard_id=shard_id,
        )
        self.secondaries: list[Node] = [
            Node(
                node_id=f"{shard_id}-secondary-{i+1}",
                role=NodeRole.SECONDARY,
                shard_id=shard_id,
            )
            for i in range(num_secondaries)
        ]

    @property
    def all_nodes(self) -> list[Node]:
        return [self.primary] + self.secondaries

    def get_node(self, node_id: str) -> Optional[Node]:
        for n in self.all_nodes:
            if n.id == node_id:
                return n
        return None

    def get_primary(self) -> Optional[Node]:
        for n in self.all_nodes:
            if n.role == NodeRole.PRIMARY and n.status == NodeStatus.ALIVE:
                return n
        return None

    def replicate(self, doc: dict):
        """Write doc to primary + all alive secondaries."""
        primary = self.get_primary()
        if primary is None:
            raise RuntimeError(f"No alive primary in replica set {self.shard_id}")
        primary.data.append(doc)
        for sec in self.secondaries:
            if sec.status == NodeStatus.ALIVE:
                sec.data.append(doc)

    def elect_new_primary(self) -> Optional[str]:
        """
        Elect the first alive secondary as primary.
        Returns the elected node's id, or None.
        """
        for sec in self.secondaries:
            if sec.status == NodeStatus.ALIVE:
                sec.role = NodeRole.PRIMARY
                return sec.id
        return None

    def to_dict(self) -> dict:
        return {
            "shard_id": self.shard_id,
            "primary": self.primary.to_dict(),
            "secondaries": [s.to_dict() for s in self.secondaries],
        }


class Shard:
    """A shard wrapping a ReplicaSet + range metadata."""

    def __init__(self, shard_id: str, num_secondaries: int,
                 range_min: Optional[int] = None, range_max: Optional[int] = None):
        self.shard_id = shard_id
        self.replica_set = ReplicaSet(shard_id, num_secondaries)
        self.range_min = range_min
        self.range_max = range_max

    def to_dict(self) -> dict:
        return {
            "shard_id": self.shard_id,
            "replica_set": self.replica_set.to_dict(),
            "range_min": self.range_min,
            "range_max": self.range_max,
        }


class Router:
    """The mongos router — routes documents to the correct shard."""

    def __init__(self, shards: list[Shard], strategy: ShardingStrategy):
        self.shards = shards
        self.strategy = strategy

    def route_hashed(self, value: str) -> tuple[Shard, str]:
        """Route by MD5 hash modulo num_shards."""
        md5 = hashlib.md5(value.encode()).hexdigest()
        bucket = int(md5, 16) % len(self.shards)
        shard = self.shards[bucket]
        explanation = (
            f"🔑 Hash MD5(\"{value}\") = {md5[:12]}… "
            f"→ bucket {bucket} (hash mod {len(self.shards)}) "
            f"→ Routed to {shard.shard_id}."
        )
        return shard, explanation

    def route_ranged(self, shard_key: int) -> tuple[Shard, str]:
        """Route by numeric range intervals."""
        for shard in self.shards:
            if shard.range_min is not None and shard.range_max is not None:
                if shard.range_min <= shard_key < shard.range_max:
                    explanation = (
                        f"📍 Shard key = {shard_key} "
                        f"→ Falls in range [{shard.range_min}–{shard.range_max}) "
                        f"→ Routed to {shard.shard_id}."
                    )
                    return shard, explanation
        # Fallback to last shard if key >= all ranges
        shard = self.shards[-1]
        explanation = (
            f"📍 Shard key = {shard_key} "
            f"→ Falls outside defined ranges, defaulting to {shard.shard_id}."
        )
        return shard, explanation


class ClusterManager:
    """Singleton managing the entire simulated topology."""

    _instance: Optional["ClusterManager"] = None

    def __init__(self):
        self.shards: list[Shard] = []
        self.router: Optional[Router] = None
        self.strategy: Optional[ShardingStrategy] = None
        self.num_shards: int = 0
        self.num_secondaries: int = 0
        self.logs: list[str] = []
        self._initialized = False
        # Stats tracking
        self.total_inserts: int = 0
        self.total_kills: int = 0
        self.total_repairs: int = 0
        self.total_elections: int = 0
        self.insert_history: list[dict] = []  # [{value, shard, timestamp}]

    @classmethod
    def get(cls) -> "ClusterManager":
        if cls._instance is None:
            cls._instance = ClusterManager()
        return cls._instance

    @property
    def initialized(self) -> bool:
        return self._initialized

    def create_cluster(self, num_shards: int, num_secondaries: int,
                       strategy: ShardingStrategy):
        """Build a new cluster topology."""
        self.shards.clear()
        self.logs.clear()
        self.num_shards = num_shards
        self.num_secondaries = num_secondaries
        self.strategy = strategy

        shard_labels = ["A", "B", "C", "D"]
        range_step = 100 // num_shards  # divide 0-100 evenly

        for i in range(num_shards):
            label = shard_labels[i]
            shard_id = f"shard-{label}"
            range_min = i * range_step
            range_max = (i + 1) * range_step if i < num_shards - 1 else 100

            shard = Shard(
                shard_id=shard_id,
                num_secondaries=num_secondaries,
                range_min=range_min if strategy == ShardingStrategy.RANGED else None,
                range_max=range_max if strategy == ShardingStrategy.RANGED else None,
            )
            self.shards.append(shard)

        self.router = Router(self.shards, strategy)
        self._initialized = True

        log_msg = (
            f"🏗️ Cluster created: {num_shards} shard(s), "
            f"{num_secondaries} secondary/ies per shard, "
            f"strategy = {strategy.value}."
        )
        self.logs.append(log_msg)

    def insert(self, value: str, shard_key: Optional[int] = None) -> dict:
        """Insert a document and return routing info."""
        if not self._initialized or self.router is None:
            raise RuntimeError("Cluster not initialized")

        if self.strategy == ShardingStrategy.HASHED:
            target_shard, explanation = self.router.route_hashed(value)
        else:
            if shard_key is None:
                raise ValueError("Shard key required for ranged strategy")
            target_shard, explanation = self.router.route_ranged(shard_key)

        primary = target_shard.replica_set.get_primary()
        if primary is None:
            msg = f"❌ No alive primary in {target_shard.shard_id}! Document rejected."
            self.logs.append(msg)
            return {"success": False, "explanation": msg, "logs": self.logs}

        doc = {
            "id": str(uuid.uuid4())[:8],
            "value": value,
            "shard_key": shard_key,
        }

        target_shard.replica_set.replicate(doc)

        alive_secondaries = [
            s.id for s in target_shard.replica_set.secondaries
            if s.status == NodeStatus.ALIVE
        ]
        replication_msg = (
            f"✅ Document \"{value}\" stored on {primary.id}, "
            f"replicated to {', '.join(alive_secondaries) if alive_secondaries else 'no alive secondaries'}."
        )

        self.logs.append(explanation)
        self.logs.append(replication_msg)

        self.total_inserts += 1
        self.insert_history.append({
            "value": value,
            "shard": target_shard.shard_id,
            "node": primary.id,
        })

        return {
            "success": True,
            "explanation": explanation,
            "replication": replication_msg,
            "target_shard": target_shard.shard_id,
            "target_node": primary.id,
            "logs": self.logs,
        }

    def kill_node(self, node_id: str) -> dict:
        """Simulate killing a node. If it's primary, trigger election."""
        node = self._find_node(node_id)
        if node is None:
            raise ValueError(f"Node {node_id} not found")
        if node.status == NodeStatus.DEAD:
            raise ValueError(f"Node {node_id} is already dead")

        node.status = NodeStatus.DEAD
        was_primary = node.role == NodeRole.PRIMARY
        election_log = None
        elected_id = None

        if was_primary:
            node.role = NodeRole.SECONDARY  # demote
            shard = self._find_shard(node.shard_id)
            if shard:
                elected_id = shard.replica_set.elect_new_primary()
                if elected_id:
                    election_log = (
                        f"🗳️ Election in {node.shard_id}: {node_id} is down! "
                        f"{elected_id} has been elected as the new Primary."
                    )
                else:
                    election_log = (
                        f"⚠️ Election in {node.shard_id}: {node_id} is down! "
                        f"No alive secondaries available. Shard is OFFLINE."
                    )

        self.total_kills += 1
        if elected_id:
            self.total_elections += 1
        kill_log = f"💀 Node {node_id} killed (was {'PRIMARY' if was_primary else 'SECONDARY'})."
        self.logs.append(kill_log)
        if election_log:
            self.logs.append(election_log)

        return {
            "killed": node_id,
            "was_primary": was_primary,
            "election_log": election_log,
            "elected_id": elected_id,
            "logs": self.logs,
        }

    def repair_node(self, node_id: str) -> dict:
        """Repair a dead node (comes back as secondary)."""
        node = self._find_node(node_id)
        if node is None:
            raise ValueError(f"Node {node_id} not found")
        if node.status == NodeStatus.ALIVE:
            raise ValueError(f"Node {node_id} is already alive")

        node.status = NodeStatus.ALIVE
        node.role = NodeRole.SECONDARY  # always comes back as secondary

        # Sync data from the current primary
        shard = self._find_shard(node.shard_id)
        if shard:
            primary = shard.replica_set.get_primary()
            if primary:
                node.data = list(primary.data)  # copy data

        self.total_repairs += 1
        repair_log = f"🔧 Node {node_id} repaired and resynced as SECONDARY."
        self.logs.append(repair_log)

        return {
            "repaired": node_id,
            "logs": self.logs,
        }

    def get_state(self) -> dict:
        """Return the full cluster state."""
        if not self._initialized:
            return {"initialized": False}

        return {
            "initialized": True,
            "strategy": self.strategy.value if self.strategy else None,
            "num_shards": self.num_shards,
            "num_secondaries": self.num_secondaries,
            "shards": [s.to_dict() for s in self.shards],
            "logs": self.logs,
            "stats": {
                "total_inserts": self.total_inserts,
                "total_kills": self.total_kills,
                "total_repairs": self.total_repairs,
                "total_elections": self.total_elections,
                "insert_history": self.insert_history,
            },
        }

    def reset(self):
        """Destroy the cluster."""
        self.shards.clear()
        self.logs.clear()
        self.insert_history.clear()
        self.router = None
        self.strategy = None
        self._initialized = False
        self.total_inserts = 0
        self.total_kills = 0
        self.total_repairs = 0
        self.total_elections = 0

    # ── helpers ──

    def _find_node(self, node_id: str) -> Optional[Node]:
        for shard in self.shards:
            node = shard.replica_set.get_node(node_id)
            if node:
                return node
        return None

    def _find_shard(self, shard_id: str) -> Optional[Shard]:
        for shard in self.shards:
            if shard.shard_id == shard_id:
                return shard
        return None


# ──────────────────────────────────────────────
#  FastAPI Application
# ──────────────────────────────────────────────

app = FastAPI(
    title="SimMongo Edu API",
    description="In-memory MongoDB cluster simulator for educational purposes.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Schemas ──

class CreateClusterRequest(BaseModel):
    num_shards: int = Field(ge=1, le=4, description="Number of shards (1-4)")
    num_secondaries: int = Field(ge=1, le=3, description="Secondaries per replica set (1-3)")
    strategy: ShardingStrategy


class InsertRequest(BaseModel):
    value: str = Field(min_length=1, description="Document value to insert")
    shard_key: Optional[int] = Field(default=None, description="Numeric shard key (required for ranged)")


# ── Endpoints ──

@app.post("/api/cluster/create")
def create_cluster(req: CreateClusterRequest):
    cm = ClusterManager.get()
    cm.create_cluster(req.num_shards, req.num_secondaries, req.strategy)
    return cm.get_state()


@app.get("/api/cluster/state")
def get_cluster_state():
    cm = ClusterManager.get()
    return cm.get_state()


@app.post("/api/cluster/insert")
def insert_document(req: InsertRequest):
    cm = ClusterManager.get()
    if not cm.initialized:
        raise HTTPException(status_code=400, detail="Cluster not initialized. Create one first.")
    try:
        result = cm.insert(req.value, req.shard_key)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/cluster/node/{node_id}/kill")
def kill_node(node_id: str):
    cm = ClusterManager.get()
    if not cm.initialized:
        raise HTTPException(status_code=400, detail="Cluster not initialized.")
    try:
        result = cm.kill_node(node_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/cluster/node/{node_id}/repair")
def repair_node(node_id: str):
    cm = ClusterManager.get()
    if not cm.initialized:
        raise HTTPException(status_code=400, detail="Cluster not initialized.")
    try:
        result = cm.repair_node(node_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/cluster/reset")
def reset_cluster():
    cm = ClusterManager.get()
    cm.reset()
    return {"message": "Cluster reset successfully."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
