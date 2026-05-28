import { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

export default function LogPanel({ logs }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="glass-card p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Terminal size={18} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Journal Pédagogique</h3>
        <span className="text-xs text-slate-500 ml-auto">{logs.length} entrée{logs.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 max-h-[400px] pr-1">
        {logs.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-8">
            <Terminal size={32} className="mx-auto mb-3 opacity-30" />
            <p>Aucune activité pour l'instant.</p>
            <p className="text-xs mt-1">Insérez un document ou déclenchez une panne pour voir les logs.</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="log-entry">
              {log}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
