import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe } from 'lucide-react';

function RouterNode({ data }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="px-8 py-5 rounded-2xl bg-gradient-to-br from-blue-600/90 to-blue-800/90 border-2 border-blue-400/50 shadow-lg shadow-blue-500/20 min-w-[180px] text-center transition-all hover:shadow-blue-500/40 hover:scale-[1.02]">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Globe size={22} className="text-blue-200" />
          <span className="font-bold text-white text-base">mongos</span>
        </div>
        <span className="text-blue-200 text-xs font-medium tracking-wide">Routeur</span>
      </div>

      {/* Tooltip — wrapping text inside node bounds */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 tooltip-content text-center z-[100]">
          🌐 Je suis le Routeur (mongos). Je reçois toutes les requêtes et les dirige vers le bon Shard.
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-blue-400 !w-3 !h-3 !border-2 !border-blue-600" />
    </div>
  );
}

export default memo(RouterNode);
