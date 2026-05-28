import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Crown, Skull, Zap } from 'lucide-react';

function PrimaryNode({ data }) {
  const { label, docCount, status, onKill, isElected } = data;
  const isDead = status === 'dead';
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-400 !w-3 !h-3 !border-2 !border-amber-600" />

      <div className={`px-5 py-4 rounded-2xl min-w-[160px] text-center transition-all duration-500 ${
        isDead
          ? 'bg-gradient-to-br from-red-600/90 to-red-800/90 border-2 border-red-400/50 shadow-lg shadow-red-500/30'
          : 'bg-gradient-to-br from-amber-500/90 to-amber-700/90 border-2 border-amber-400/50 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02]'
      }`}>
        <div className="flex items-center justify-center gap-2 mb-1">
          {isDead ? (
            <Skull size={18} className="text-red-200" />
          ) : (
            <Crown size={18} className="text-amber-200" />
          )}
          <span className={`font-bold text-sm ${isDead ? 'text-red-200 line-through' : 'text-white'}`}>
            {label}
          </span>
        </div>
        <span className={`text-xs font-medium ${isDead ? 'text-red-300' : 'text-amber-200'}`}>
          {isDead ? 'HORS SERVICE' : isElected ? '⬆ Élu Primaire' : 'Primaire'}
        </span>
        <div className={`text-xs mt-1 ${isDead ? 'text-red-300' : 'text-amber-100'}`}>
          📄 {docCount || 0} doc{(docCount || 0) !== 1 ? 's' : ''}
        </div>

        {/* Kill button */}
        {!isDead && onKill && (
          <button
            onClick={(e) => { e.stopPropagation(); onKill(); }}
            className="mt-2 px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-xs hover:bg-red-500/40 transition-all cursor-pointer flex items-center gap-1 mx-auto"
          >
            <Zap size={12} />
            Panne
          </button>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 tooltip-content text-center z-[100]">
          {isDead
            ? '💀 Ce nœud est en panne. Un Secondaire a été élu en remplacement.'
            : isElected
              ? '🗳️ J\'ai été élu Primaire après la panne du Primaire original. Je gère maintenant les écritures.'
              : '👑 Je suis le Primaire. Je reçois les écritures et réplique vers les Secondaires.'}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-amber-400 !w-3 !h-3 !border-2 !border-amber-600" />
    </div>
  );
}

export default memo(PrimaryNode);
