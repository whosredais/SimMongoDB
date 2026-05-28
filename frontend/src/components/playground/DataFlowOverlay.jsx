import { useState, useEffect, useCallback } from 'react';

const DURATIONS = { routing: 800, traveling: 1500, writing: 600, replicating: 800, done: 400 };
const PHASES = ['routing', 'traveling', 'writing', 'replicating', 'done'];
const LABELS = {
  routing: '🔍 Analyse de la clé de routage...',
  traveling: '📦 Envoi vers le shard cible...',
  writing: '✍️ Écriture sur le Primaire...',
  replicating: '🔄 Réplication vers les Secondaires...',
  done: '✅ Document stocké avec succès !',
};

export default function DataFlowOverlay({ animation, clusterState, onComplete }) {
  const [phase, setPhase] = useState(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const startAnimation = useCallback(() => {
    if (!animation?.active) return;
    setVisible(true);
    let idx = 0;
    const runPhase = () => {
      if (idx >= PHASES.length) {
        setTimeout(() => { setVisible(false); setPhase(null); onComplete?.(); }, 300);
        return;
      }
      const p = PHASES[idx];
      setPhase(p);
      setProgress(0);
      const dur = DURATIONS[p];
      const start = Date.now();
      const tick = () => {
        const pct = Math.min((Date.now() - start) / dur, 1);
        setProgress(pct);
        if (pct < 1) requestAnimationFrame(tick);
        else { idx++; setTimeout(runPhase, 100); }
      };
      requestAnimationFrame(tick);
    };
    runPhase();
  }, [animation, onComplete]);

  useEffect(() => { if (animation?.active) startAnimation(); }, [animation?.active, startAnimation]);

  if (!visible || !animation?.active) return null;

  const shards = clusterState?.shards || [];
  const si = shards.findIndex(s => s.shard_id === animation.targetShard);
  const n = shards.length;
  const rX = 400, rY = 50;
  const sp = 800 / (n + 1);
  const tX = sp * (si + 1), pY = 220;
  const mY = (rY + pY) / 2;
  const curve = `M ${rX} ${rY+25} C ${rX} ${mY}, ${tX} ${mY}, ${tX} ${pY-20}`;

  const bezier = (t) => {
    const i = 1-t;
    const p0={x:rX,y:rY+25}, p1={x:rX,y:mY}, p2={x:tX,y:mY}, p3={x:tX,y:pY-20};
    return {
      x: i**3*p0.x + 3*i**2*t*p1.x + 3*i*t**2*p2.x + t**3*p3.x,
      y: i**3*p0.y + 3*i**2*t*p1.y + 3*i*t**2*p2.y + t**3*p3.y,
    };
  };

  const shard = shards[si];
  const nSec = shard?.replica_set?.secondaries?.length || 0;
  const secPos = Array.from({length: nSec}, (_, i) => ({
    x: tX - 60 + (120 / (nSec+1)) * (i+1), y: 370,
  }));

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      <svg viewBox="0 0 800 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow-p"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="glow-s"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {phase === 'routing' && <>
          <circle cx={rX} cy={rY} r={18+progress*15} fill="none" stroke="#3B82F6" strokeWidth="2" opacity={1-progress*0.7}/>
          <circle cx={rX} cy={rY} r={18+progress*25} fill="none" stroke="#3B82F6" strokeWidth="1" opacity={1-progress}/>
        </>}

        {(phase==='traveling'||phase==='writing'||phase==='replicating') &&
          <path d={curve} fill="none" stroke="#6366F1" strokeWidth="2" strokeDasharray="6 4" opacity={0.35}/>
        }

        {phase === 'traveling' && (() => {
          const pos = bezier(progress);
          return <>
            <path d={curve} fill="none" stroke="#6366F1" strokeWidth="3" strokeDasharray={`${progress*300} 1000`} opacity={0.8}/>
            <circle cx={pos.x} cy={pos.y} r={7} fill="#6366F1" filter="url(#glow-p)"/>
            <circle cx={pos.x} cy={pos.y} r={4} fill="#A5B4FC"/>
            {progress > 0.1 && [0.06,0.12,0.18].map((o,i) => {
              const p = bezier(Math.max(0, progress-o));
              return <circle key={i} cx={p.x} cy={p.y} r={3-i} fill="#6366F1" opacity={0.5-i*0.15}/>;
            })}
          </>;
        })()}

        {phase === 'writing' && <>
          <circle cx={tX} cy={pY} r={14+progress*20} fill="none" stroke="#F59E0B" strokeWidth="2.5" opacity={1-progress*0.6}/>
          <circle cx={tX} cy={pY} r={14+progress*35} fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity={1-progress}/>
          <circle cx={tX} cy={pY} r={8} fill="#F59E0B" filter="url(#glow-p)" opacity={0.9}/>
        </>}

        {phase === 'replicating' && secPos.map((sec,i) => {
          const t = Math.min(progress*1.3,1);
          const px = tX+(sec.x-tX)*t, py = pY+(sec.y-pY)*t;
          return <g key={i}>
            <line x1={tX} y1={pY+10} x2={sec.x} y2={sec.y-10} stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 3" opacity={0.4}/>
            <circle cx={px} cy={py} r={5} fill="#10B981" filter="url(#glow-s)"/>
            <circle cx={px} cy={py} r={2.5} fill="#6EE7B7"/>
          </g>;
        })}

        {phase === 'done' && <g>
          <circle cx={tX} cy={pY} r={16} fill="#10B981" opacity={0.9*(1-progress*0.3)} filter="url(#glow-p)"/>
          <text x={tX} y={pY+5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">✓</text>
        </g>}
      </svg>

      {phase && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flow-label-anim">
          <div className="px-5 py-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 shadow-xl shadow-indigo-500/10">
            <p className="text-sm text-white font-medium text-center whitespace-nowrap">{LABELS[phase]}</p>
            <div className="w-full h-1 rounded-full bg-slate-700 mt-2 overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${progress*100}%`,
                background: phase==='replicating'?'#10B981':phase==='writing'?'#F59E0B':'#6366F1',
                transition: 'none',
              }}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
