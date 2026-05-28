import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClusterState, killNode, repairNode, resetCluster } from '../api';
import ClusterGraph from '../components/playground/ClusterGraph';
import InsertConsole from '../components/playground/InsertConsole';
import LogPanel from '../components/playground/LogPanel';
import MetricsDashboard from '../components/playground/MetricsDashboard';
import DataFlowOverlay from '../components/playground/DataFlowOverlay';
import QuizModal from '../components/playground/QuizModal';
import { ArrowLeft, RotateCcw, Database, Layers, BarChart3, Terminal, Brain } from 'lucide-react';

export default function PlaygroundPage() {
  const navigate = useNavigate();
  const [cluster, setCluster] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sidebar tab: 'console' or 'metrics'
  const [leftTab, setLeftTab] = useState('console');

  // Data flow animation state
  const [flowAnimation, setFlowAnimation] = useState(null);

  // Quiz modal
  const [showQuiz, setShowQuiz] = useState(false);

  const fetchState = useCallback(async () => {
    try {
      const state = await getClusterState();
      if (!state.initialized) {
        navigate('/wizard');
        return;
      }
      setCluster(state);
      setLogs(state.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const handleInsertResult = useCallback((result) => {
    setLogs(result.logs || []);

    // Trigger data flow animation
    if (result.success && result.target_shard && result.target_node) {
      setFlowAnimation({
        active: true,
        targetShard: result.target_shard,
        targetNode: result.target_node,
      });
    }

    fetchState();
  }, [fetchState]);

  const handleFlowComplete = useCallback(() => {
    setFlowAnimation(null);
  }, []);

  const handleKillNode = useCallback(async (nodeId) => {
    try {
      const result = await killNode(nodeId);
      setLogs(result.logs || []);
      await fetchState();
    } catch (err) {
      console.error(err);
    }
  }, [fetchState]);

  const handleRepairNode = useCallback(async (nodeId) => {
    try {
      const result = await repairNode(nodeId);
      setLogs(result.logs || []);
      await fetchState();
    } catch (err) {
      console.error(err);
    }
  }, [fetchState]);

  const handleReset = useCallback(async () => {
    try {
      await resetCluster();
      navigate('/wizard');
    } catch (err) {
      console.error(err);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <Database size={48} className="mx-auto text-indigo-400 animate-pulse mb-4" />
          <p className="text-slate-400">Chargement du cluster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0F172A] flex flex-col overflow-hidden">
      {/* ── Unified Header ── */}
      <nav className="flex items-center justify-between px-6 py-3 border-b border-slate-800/50 bg-[#0F172A]/80 backdrop-blur-xl shrink-0">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Reconfigurer</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Database size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-base leading-tight">
              SimMongo <span className="text-indigo-400">Edu</span>
            </span>
            <span className="text-[10px] text-slate-500 tracking-widest uppercase">Playground</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {cluster && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Layers size={14} />
              <span>{cluster.num_shards} shard{cluster.num_shards > 1 ? 's' : ''}</span>
              <span className="text-slate-600">•</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                cluster.strategy === 'hashed' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-purple-500/20 text-purple-300'
              }`}>
                {cluster.strategy === 'hashed' ? 'Hash' : 'Range'}
              </span>
            </div>
          )}

          {/* Quiz button */}
          <button
            onClick={() => setShowQuiz(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600/80 to-purple-600/80 border border-indigo-500/30 text-white text-xs font-medium hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25"
            title="Quiz MongoDB"
          >
            <Brain size={14} />
            <span className="hidden sm:inline">Quiz</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all cursor-pointer"
            title="Réinitialiser"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Tabbed Console / Metrics */}
        <div className="w-[320px] shrink-0 border-r border-slate-800/50 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-800/50 shrink-0">
            <button
              onClick={() => setLeftTab('console')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                leftTab === 'console'
                  ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Terminal size={13} />
              Console
            </button>
            <button
              onClick={() => setLeftTab('metrics')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                leftTab === 'metrics'
                  ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <BarChart3 size={13} />
              Métriques
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {leftTab === 'console' ? (
              <>
                <InsertConsole
                  strategy={cluster?.strategy}
                  onInsertResult={handleInsertResult}
                />
                {/* Shard ranges info (if ranged) */}
                {cluster?.strategy === 'ranged' && (
                  <div className="glass-card p-4">
                    <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                      <Layers size={14} className="text-purple-400" />
                      Intervalles des Shards
                    </h4>
                    <div className="space-y-2">
                      {cluster.shards.map((shard) => (
                        <div
                          key={shard.shard_id}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
                        >
                          <span className="text-sm text-amber-400 font-medium">{shard.shard_id}</span>
                          <span className="text-xs text-slate-400">[{shard.range_min}–{shard.range_max})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <MetricsDashboard clusterState={cluster} />
            )}
          </div>
        </div>

        {/* Center: React Flow Graph + Data Flow Overlay */}
        <div className="flex-1 p-4 relative">
          <ClusterGraph
            clusterState={cluster}
            onKillNode={handleKillNode}
            onRepairNode={handleRepairNode}
          />
          <DataFlowOverlay
            animation={flowAnimation}
            clusterState={cluster}
            onComplete={handleFlowComplete}
          />
        </div>

        {/* Right Sidebar: Log Panel */}
        <div className="w-[340px] shrink-0 border-l border-slate-800/50 p-4 overflow-hidden">
          <LogPanel logs={logs} />
        </div>
      </div>

      {/* ── Quiz Modal ── */}
      {showQuiz && <QuizModal onClose={() => setShowQuiz(false)} />}
    </div>
  );
}
