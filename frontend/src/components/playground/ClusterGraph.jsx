import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import RouterNodeComponent from './RouterNode';
import PrimaryNodeComponent from './PrimaryNode';
import SecondaryNodeComponent from './SecondaryNode';

const nodeTypes = {
  routerNode: RouterNodeComponent,
  primaryNode: PrimaryNodeComponent,
  secondaryNode: SecondaryNodeComponent,
};

export default function ClusterGraph({ clusterState, onKillNode, onRepairNode }) {
  const { flowNodes, flowEdges } = useMemo(() => {
    if (!clusterState?.initialized) return { flowNodes: [], flowEdges: [] };

    const nodes = [];
    const edges = [];
    const shards = clusterState.shards;
    const numShards = shards.length;

    // Canvas metrics — wider spacing so nodes don't overlap
    const shardSpacing = Math.max(320, 900 / numShards);
    const totalWidth = numShards * shardSpacing;
    const startX = -totalWidth / 2 + shardSpacing / 2;

    // Router node (top center)
    nodes.push({
      id: 'router',
      type: 'routerNode',
      position: { x: -80, y: 0 },
      data: { label: 'mongos' },
      draggable: true,
    });

    shards.forEach((shard, si) => {
      const shardX = startX + si * shardSpacing;
      const rs = shard.replica_set;

      // Gather ALL nodes for this shard (primary slot + secondaries)
      const allShardNodes = [rs.primary, ...rs.secondaries];

      // Find who is currently the ALIVE primary (could be original primary OR an elected secondary)
      const currentAlivePrimary = allShardNodes.find(
        (n) => n.role === 'primary' && n.status === 'alive'
      );

      // The current alive primary ID (for routing edges from router)
      const currentPrimaryId = currentAlivePrimary ? currentAlivePrimary.id : null;

      // ─── ORIGINAL PRIMARY SLOT ───
      const origPrimary = rs.primary;
      const origPrimaryId = origPrimary.id;
      const origIsDead = origPrimary.status === 'dead';
      const origIsStillPrimary = origPrimary.role === 'primary' && origPrimary.status === 'alive';

      if (origIsDead) {
        // Dead original primary → render as dead secondary-style node with repair
        nodes.push({
          id: origPrimaryId,
          type: 'secondaryNode',
          position: { x: shardX - 75, y: 160 },
          data: {
            label: origPrimaryId,
            docCount: origPrimary.doc_count,
            status: 'dead',
            onRepair: () => onRepairNode(origPrimaryId),
          },
          draggable: true,
        });
      } else if (origIsStillPrimary) {
        // Alive and still primary
        nodes.push({
          id: origPrimaryId,
          type: 'primaryNode',
          position: { x: shardX - 75, y: 160 },
          data: {
            label: origPrimaryId,
            docCount: origPrimary.doc_count,
            status: origPrimary.status,
            shardId: shard.shard_id,
            onKill: () => onKillNode(origPrimaryId),
          },
          draggable: true,
        });
      } else {
        // Alive but demoted to secondary (was repaired after being dead)
        nodes.push({
          id: origPrimaryId,
          type: 'secondaryNode',
          position: { x: shardX - 75, y: 160 },
          data: {
            label: origPrimaryId,
            docCount: origPrimary.doc_count,
            status: origPrimary.status,
            onRepair: null,
          },
          draggable: true,
        });
      }

      // Edge: Router → current alive primary
      if (origIsStillPrimary) {
        edges.push({
          id: `router-${origPrimaryId}`,
          source: 'router',
          target: origPrimaryId,
          animated: true,
          style: { stroke: '#3B82F6', strokeWidth: 2 },
        });
      }

      // ─── SECONDARY NODES ───
      const numSec = rs.secondaries.length;
      const secSpacing = Math.max(180, shardSpacing / (numSec + 0.5));
      const secTotalWidth = numSec * secSpacing;
      const secStartX = shardX - secTotalWidth / 2 + secSpacing / 2;

      rs.secondaries.forEach((sec, sei) => {
        const secId = sec.id;
        const secX = secStartX + sei * secSpacing;
        const isElectedPrimary = sec.role === 'primary' && sec.status === 'alive';

        if (isElectedPrimary) {
          // This secondary was elected as the new primary
          nodes.push({
            id: secId,
            type: 'primaryNode',
            position: { x: secX - 75, y: 340 },
            data: {
              label: `${secId} ⬆`,
              docCount: sec.doc_count,
              status: sec.status,
              shardId: shard.shard_id,
              onKill: () => onKillNode(secId),
              isElected: true,
            },
            className: 'animate-elected',
            draggable: true,
          });

          // Router → elected primary
          edges.push({
            id: `router-${secId}`,
            source: 'router',
            target: secId,
            animated: true,
            style: { stroke: '#F59E0B', strokeWidth: 2 },
          });

          // Elected primary → dead original primary (replication link, dashed)
          if (origIsDead) {
            edges.push({
              id: `${secId}-${origPrimaryId}`,
              source: secId,
              target: origPrimaryId,
              style: { stroke: '#EF4444', strokeWidth: 1.5, strokeDasharray: '5,5' },
            });
          } else {
            // Original is alive but secondary now → normal replication
            edges.push({
              id: `${secId}-${origPrimaryId}`,
              source: secId,
              target: origPrimaryId,
              style: { stroke: '#10B981', strokeWidth: 1.5 },
            });
          }
        } else {
          // Normal secondary node
          const secIsDead = sec.status === 'dead';
          nodes.push({
            id: secId,
            type: 'secondaryNode',
            position: { x: secX - 65, y: 340 },
            data: {
              label: secId,
              docCount: sec.doc_count,
              status: sec.status,
              onRepair: secIsDead ? () => onRepairNode(secId) : null,
            },
            draggable: true,
          });

          // Edge: current primary → this secondary
          if (currentPrimaryId) {
            edges.push({
              id: `${currentPrimaryId}-${secId}`,
              source: currentPrimaryId,
              target: secId,
              style: {
                stroke: secIsDead ? '#EF4444' : '#10B981',
                strokeWidth: 1.5,
                strokeDasharray: secIsDead ? '5,5' : undefined,
              },
            });
          }
        }
      });

      // If original primary is dead but still has no edge from elected → add dashed link
      if (origIsDead && !currentPrimaryId) {
        // All nodes are dead, no edges to add
      }
    });

    return { flowNodes: nodes, flowEdges: edges };
  }, [clusterState, onKillNode, onRepairNode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Sync when clusterState changes
  useMemo(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-700/50">
      <ReactFlow
        nodes={nodes}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1E293B" gap={20} size={1} />
        <Controls
          className="!bg-slate-800 !border-slate-700 !rounded-xl !shadow-xl [&>button]:!bg-slate-700 [&>button]:!border-slate-600 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-600"
        />
      </ReactFlow>
    </div>
  );
}
