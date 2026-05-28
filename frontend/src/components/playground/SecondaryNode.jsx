import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Copy, Skull, Wrench } from 'lucide-react';

function SecondaryNode({ data }) {
  const { label, docCount, status, onRepair } = data;
  const isDead = status === 'dead';
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Handle type="target" position={Position.Top} className="!bg-emerald-400 !w-3 !h-3 !border-2 !border-emerald-600" />

      <div className={`px-5 py-3 rounded-2xl min-w-[140px] text-center transition-all duration-500 ${
        isDead
          ? 'bg-gradient-to-br from-red-600/80 to-red-800/80 border-2 border-red-400/40 shadow-lg shadow-red-500/20'
          : 'bg-gradient-to-br from-emerald-600/80 to-emerald-800/80 border-2 border-emerald-400/40 shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/30 hover:scale-[1.02]'
      }`}>
        <div className="flex items-center justify-center gap-2 mb-1">
          {isDead ? (
            <Skull size={16} className="text-red-200" />
          ) : (
            <Copy size={16} className="text-emerald-200" />
          )}
          <span className={`font-semibold text-sm ${isDead ? 'text-red-200 line-through' : 'text-white'}`}>
            {label}
          </span>
        </div>
        <span className={`text-xs font-medium ${isDead ? 'text-red-300' : 'text-emerald-200'}`}>
          {isDead ? 'HORS SERVICE' : 'Secondaire'}
        </span>
        <div className={`text-xs mt-1 ${isDead ? 'text-red-300' : 'text-emerald-100'}`}>
          📄 {docCount || 0} doc{(docCount || 0) !== 1 ? 's' : ''}
        </div>

        {isDead && onRepair && (
          <button
            onClick={(e) => { e.stopPropagation(); onRepair(); }}
            className="mt-2 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs hover:bg-emerald-500/40 transition-all cursor-pointer flex items-center gap-1 mx-auto"
          >
            <Wrench size={12} />
            Réparer
          </button>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 tooltip-content text-center z-[100]">
          {isDead
            ? '💀 Ce nœud est en panne. Cliquez "Réparer" pour le remettre en service.'
            : '📋 Je suis un Secondaire. Je maintiens une copie des données pour la haute disponibilité.'}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-emerald-400 !w-3 !h-3 !border-2 !border-emerald-600" />
    </div>
  );
}

export default memo(SecondaryNode);
