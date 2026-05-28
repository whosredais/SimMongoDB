import { useMemo } from 'react';
import { BarChart3, PieChart, Zap, Wrench, Vote, FileText, TrendingUp } from 'lucide-react';

const SHARD_COLORS = {
  'shard-A': { bar: '#6366F1', bg: 'rgba(99,102,241,0.15)', text: '#A5B4FC' },
  'shard-B': { bar: '#8B5CF6', bg: 'rgba(139,92,246,0.15)', text: '#C4B5FD' },
  'shard-C': { bar: '#EC4899', bg: 'rgba(236,72,153,0.15)', text: '#F9A8D4' },
  'shard-D': { bar: '#F59E0B', bg: 'rgba(245,158,11,0.15)', text: '#FCD34D' },
};

function getShardColor(shardId) {
  return SHARD_COLORS[shardId] || { bar: '#64748B', bg: 'rgba(100,116,139,0.15)', text: '#94A3B8' };
}

export default function MetricsDashboard({ clusterState }) {
  const stats = clusterState?.stats || {};
  const shards = clusterState?.shards || [];

  // Compute per-shard document counts
  const shardData = useMemo(() => {
    return shards.map((s) => {
      const rs = s.replica_set;
      const primary = rs.primary;
      const docCount = primary.doc_count || 0;
      return { id: s.shard_id, docCount, color: getShardColor(s.shard_id) };
    });
  }, [shards]);

  const totalDocs = shardData.reduce((sum, s) => sum + s.docCount, 0);
  const maxDocs = Math.max(...shardData.map((s) => s.docCount), 1);

  // Pie chart data
  const pieSegments = useMemo(() => {
    if (totalDocs === 0) return [];
    let cumulative = 0;
    return shardData.map((s) => {
      const pct = s.docCount / totalDocs;
      const start = cumulative;
      cumulative += pct;
      return { ...s, pct, start, end: cumulative };
    });
  }, [shardData, totalDocs]);

  const insertHistory = stats.insert_history || [];
  const recentInserts = insertHistory.slice(-15).reverse();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Stat counters ── */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={<FileText size={15} />} label="Insertions" value={stats.total_inserts || 0} color="indigo" />
        <StatCard icon={<Zap size={15} />} label="Pannes" value={stats.total_kills || 0} color="red" />
        <StatCard icon={<Wrench size={15} />} label="Réparations" value={stats.total_repairs || 0} color="emerald" />
        <StatCard icon={<Vote size={15} />} label="Élections" value={stats.total_elections || 0} color="amber" />
      </div>

      {/* ── Bar Chart ── */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={15} className="text-indigo-400" />
          <h4 className="text-xs font-bold text-white">Documents par Shard</h4>
        </div>
        {shardData.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">Aucun shard configuré</p>
        ) : (
          <div className="space-y-2.5">
            {shardData.map((s) => {
              const widthPct = maxDocs > 0 ? (s.docCount / maxDocs) * 100 : 0;
              return (
                <div key={s.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: s.color.text }}>{s.id}</span>
                    <span className="text-xs text-slate-400 font-mono">{s.docCount}</span>
                  </div>
                  <div className="w-full h-5 rounded-lg overflow-hidden" style={{ background: s.color.bg }}>
                    <div
                      className="h-full rounded-lg transition-all duration-700 ease-out bar-grow-anim"
                      style={{
                        width: `${widthPct}%`,
                        background: `linear-gradient(90deg, ${s.color.bar}, ${s.color.bar}CC)`,
                        boxShadow: `0 0 12px ${s.color.bar}40`,
                        minWidth: s.docCount > 0 ? '8px' : '0',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Pie Chart ── */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <PieChart size={15} className="text-purple-400" />
          <h4 className="text-xs font-bold text-white">Distribution (%)</h4>
        </div>
        {totalDocs === 0 ? (
          <div className="text-center py-6">
            <PieChart size={36} className="mx-auto text-slate-700 mb-2" />
            <p className="text-xs text-slate-500">Insérez des documents pour voir la distribution</p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* SVG Donut */}
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {pieSegments.map((seg, i) => {
                  const circumference = Math.PI * 2 * 15.9155;
                  const dashLen = seg.pct * circumference;
                  const dashOffset = -seg.start * circumference;
                  return (
                    <circle
                      key={i}
                      cx="18" cy="18" r="15.9155"
                      fill="none"
                      stroke={seg.color.bar}
                      strokeWidth="3.5"
                      strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                      strokeDashoffset={dashOffset}
                      className="pie-segment-anim"
                      style={{ filter: `drop-shadow(0 0 4px ${seg.color.bar}60)` }}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-white leading-none">{totalDocs}</span>
                <span className="text-[9px] text-slate-400">docs</span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-1.5">
              {shardData.map((s) => {
                const pct = totalDocs > 0 ? Math.round((s.docCount / totalDocs) * 100) : 0;
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color.bar }} />
                    <span className="text-[11px] text-slate-300 flex-1">{s.id}</span>
                    <span className="text-[11px] font-mono font-bold" style={{ color: s.color.text }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Recent Inserts Timeline ── */}
      {recentInserts.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-emerald-400" />
            <h4 className="text-xs font-bold text-white">Dernières Insertions</h4>
            <span className="text-[10px] text-slate-500 ml-auto">{recentInserts.length} récentes</span>
          </div>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            {recentInserts.map((ins, i) => {
              const c = getShardColor(ins.shard);
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs"
                  style={{ background: c.bg }}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.bar }} />
                  <span className="text-slate-300 truncate flex-1" title={ins.value}>
                    "{ins.value}"
                  </span>
                  <span className="text-[10px] font-medium shrink-0" style={{ color: c.text }}>
                    → {ins.shard}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Mini stat card ── */
function StatCard({ icon, label, value, color }) {
  const colors = {
    indigo: { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', text: '#A5B4FC', num: '#818CF8' },
    red: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', text: '#FCA5A5', num: '#F87171' },
    emerald: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', text: '#6EE7B7', num: '#34D399' },
    amber: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', text: '#FCD34D', num: '#FBBF24' },
  };
  const c = colors[color] || colors.indigo;

  return (
    <div
      className="rounded-xl px-3 py-2.5 flex items-center gap-2.5 transition-all duration-300 hover:scale-[1.02]"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div style={{ color: c.text }}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-lg font-black leading-none stat-counter-anim" style={{ color: c.num }}>{value}</span>
        <span className="text-[9px] text-slate-500 mt-0.5">{label}</span>
      </div>
    </div>
  );
}
