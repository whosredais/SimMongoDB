import { useState } from 'react';
import { insertDocument } from '../../api';
import { Send, Hash, ArrowDownUp, Loader2 } from 'lucide-react';

export default function InsertConsole({ strategy, onInsertResult }) {
  const [value, setValue] = useState('');
  const [shardKey, setShardKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isRanged = strategy === 'ranged';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const payload = {
        value: value.trim(),
        shard_key: isRanged ? parseInt(shardKey, 10) : null,
      };
      const result = await insertDocument(payload);
      onInsertResult(result);
      setValue('');
      setShardKey('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'insertion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        {isRanged ? (
          <ArrowDownUp size={18} className="text-purple-400" />
        ) : (
          <Hash size={18} className="text-indigo-400" />
        )}
        <h3 className="text-sm font-bold text-white">Console d'Insertion</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          isRanged ? 'bg-purple-500/20 text-purple-300' : 'bg-indigo-500/20 text-indigo-300'
        }`}>
          {isRanged ? 'Range' : 'Hash'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Donnée (valeur du document)</label>
          <input
            id="input-doc-value"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder='Ex: {"nom": "Alice", "age": 25}'
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {isRanged && (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Clé de partitionnement (0–99)</label>
            <input
              id="input-shard-key"
              type="number"
              min="0"
              max="99"
              value={shardKey}
              onChange={(e) => setShardKey(e.target.value)}
              placeholder="Ex: 45"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        )}

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            ❌ {error}
          </div>
        )}

        <button
          id="btn-insert"
          type="submit"
          disabled={loading || !value.trim() || (isRanged && !shardKey)}
          className="w-full btn-glow px-4 py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {loading ? 'Insertion...' : 'Insérer le Document'}
        </button>
      </form>
    </div>
  );
}
