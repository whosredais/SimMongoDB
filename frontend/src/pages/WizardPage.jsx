import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCluster } from '../api';
import {
  ArrowLeft, ArrowRight, Rocket, Database,
  Server, Copy, Hash, ArrowDownUp, Minus, Plus, Check, Loader2
} from 'lucide-react';

const STEPS = ['Topologie', 'Réplication', 'Stratégie'];

export default function WizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Config state
  const [numShards, setNumShards] = useState(2);
  const [numSecondaries, setNumSecondaries] = useState(2);
  const [strategy, setStrategy] = useState('hashed');

  const handleLaunch = async () => {
    setLoading(true);
    try {
      await createCluster({
        num_shards: numShards,
        num_secondaries: numSecondaries,
        strategy,
      });
      navigate('/playground');
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const totalNodes = numShards * (1 + numSecondaries) + 1; // +1 for router

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      {/* ── Unified Header ── */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-800/50 bg-[#0F172A]/80 backdrop-blur-xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Retour</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Database size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-base leading-tight">
              SimMongo <span className="text-indigo-400">Edu</span>
            </span>
            <span className="text-[10px] text-slate-500 tracking-widest uppercase">Configurateur</span>
          </div>
        </div>
        <div className="w-24" />
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* ── Step indicator ── */}
        <div className="flex items-center gap-5 mb-14">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                i < step ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' :
                i === step ? 'bg-indigo-500/20 text-indigo-400 border-2 border-indigo-500 animate-pulse-glow' :
                'bg-slate-800 text-slate-500 border-2 border-slate-700'
              }`}>
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block font-medium ${i === step ? 'text-indigo-400' : i < step ? 'text-white' : 'text-slate-500'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`w-16 h-0.5 rounded-full ${i < step ? 'bg-indigo-500' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step content ── */}
        <div className="w-full max-w-xl animate-fade-in" key={step}>
          {step === 0 && (
            <StepTopology numShards={numShards} setNumShards={setNumShards} />
          )}
          {step === 1 && (
            <StepReplication numSecondaries={numSecondaries} setNumSecondaries={setNumSecondaries} />
          )}
          {step === 2 && (
            <StepStrategy strategy={strategy} setStrategy={setStrategy} numShards={numShards} />
          )}
        </div>

        {/* ── Navigation buttons ── */}
        <div className="flex items-center gap-4 mt-12">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-7 py-3.5 rounded-xl border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-all flex items-center gap-2 cursor-pointer text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Précédent
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="btn-glow px-7 py-3.5 rounded-xl text-white font-medium flex items-center gap-2 cursor-pointer text-sm"
            >
              Suivant
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              id="btn-launch"
              onClick={handleLaunch}
              disabled={loading}
              className="btn-glow px-10 py-3.5 rounded-xl text-white font-semibold flex items-center gap-3 disabled:opacity-50 cursor-pointer text-base"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Rocket size={20} />}
              {loading ? 'Création...' : 'Lancer la Simulation'}
            </button>
          )}
        </div>

        {/* ── Live preview ── */}
        <div className="mt-14 glass-card p-8 w-full max-w-xl">
          <h4 className="text-xs text-slate-400 font-semibold mb-5 uppercase tracking-widest">Aperçu du Cluster</h4>
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-3xl font-black text-blue-400">1</div>
              <span className="text-slate-500 text-xs">Routeur</span>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-3xl font-black text-amber-400">{numShards}</div>
              <span className="text-slate-500 text-xs">Shard{numShards > 1 ? 's' : ''}</span>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-3xl font-black text-amber-400">{numShards}</div>
              <span className="text-slate-500 text-xs">Primaire{numShards > 1 ? 's' : ''}</span>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-3xl font-black text-emerald-400">{numShards * numSecondaries}</div>
              <span className="text-slate-500 text-xs">Secondaire{numShards * numSecondaries > 1 ? 's' : ''}</span>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-3xl font-black text-indigo-400">{totalNodes}</div>
              <span className="text-slate-500 text-xs">Total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step Components ─── */

function StepTopology({ numShards, setNumShards }) {
  return (
    <div className="glass-card p-10">
      <div className="flex items-center gap-3 mb-3">
        <Database size={26} className="text-indigo-400" />
        <h2 className="text-2xl font-bold text-white">Nombre de Shards</h2>
      </div>
      <p className="text-slate-400 text-sm mb-10 leading-relaxed">
        Un Shard est un fragment de votre base de données. Plus vous avez de Shards, plus vos données sont distribuées sur plusieurs machines.
      </p>
      <div className="flex items-center justify-center gap-8">
        <button
          onClick={() => setNumShards(Math.max(1, numShards - 1))}
          className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:border-indigo-500 hover:text-indigo-400 transition-all cursor-pointer"
        >
          <Minus size={22} />
        </button>
        <div className="text-7xl font-black text-indigo-400 w-24 text-center">{numShards}</div>
        <button
          onClick={() => setNumShards(Math.min(4, numShards + 1))}
          className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:border-indigo-500 hover:text-indigo-400 transition-all cursor-pointer"
        >
          <Plus size={22} />
        </button>
      </div>
      {/* Visual shard preview */}
      <div className="flex justify-center gap-4 mt-10">
        {Array.from({ length: numShards }).map((_, i) => (
          <div key={i} className="w-18 h-18 p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center transition-all duration-300 hover:scale-105">
            <span className="text-amber-400 font-bold">Shard {String.fromCharCode(65 + i)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepReplication({ numSecondaries, setNumSecondaries }) {
  return (
    <div className="glass-card p-10">
      <div className="flex items-center gap-3 mb-3">
        <Copy size={26} className="text-emerald-400" />
        <h2 className="text-2xl font-bold text-white">Secondaires par Shard</h2>
      </div>
      <p className="text-slate-400 text-sm mb-10 leading-relaxed">
        Chaque Shard contient 1 Primaire (fixe) + N Secondaires. Les Secondaires sont des copies de secours pour la haute disponibilité.
      </p>
      <div className="flex items-center justify-center gap-8">
        <button
          onClick={() => setNumSecondaries(Math.max(1, numSecondaries - 1))}
          className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-all cursor-pointer"
        >
          <Minus size={22} />
        </button>
        <div className="text-7xl font-black text-emerald-400 w-24 text-center">{numSecondaries}</div>
        <button
          onClick={() => setNumSecondaries(Math.min(3, numSecondaries + 1))}
          className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-all cursor-pointer"
        >
          <Plus size={22} />
        </button>
      </div>
      {/* Visual preview */}
      <div className="flex justify-center gap-4 mt-10 items-end">
        <div className="p-3 px-5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
          <span className="text-amber-400 font-bold text-sm">Primaire</span>
        </div>
        {Array.from({ length: numSecondaries }).map((_, i) => (
          <div key={i} className="p-3 px-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-emerald-400 font-bold text-sm">Sec. {i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepStrategy({ strategy, setStrategy, numShards }) {
  const shardLabels = Array.from({ length: numShards }, (_, i) => String.fromCharCode(65 + i));
  const rangeStep = Math.floor(100 / numShards);

  return (
    <div className="glass-card p-10">
      <div className="flex items-center gap-3 mb-3">
        <ArrowDownUp size={26} className="text-purple-400" />
        <h2 className="text-2xl font-bold text-white">Stratégie de Partitionnement</h2>
      </div>
      <p className="text-slate-400 text-sm mb-8 leading-relaxed">
        Comment les données seront-elles réparties entre les Shards ?
      </p>

      <div className="grid grid-cols-2 gap-5">
        {/* Hashed */}
        <button
          onClick={() => setStrategy('hashed')}
          className={`p-6 rounded-xl border-2 text-left transition-all cursor-pointer ${
            strategy === 'hashed'
              ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
          }`}
        >
          <Hash size={28} className={strategy === 'hashed' ? 'text-indigo-400' : 'text-slate-500'} />
          <h4 className={`font-bold mt-4 mb-2 text-lg ${strategy === 'hashed' ? 'text-white' : 'text-slate-300'}`}>
            Hachage (Hash)
          </h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            Distribution équitable via un hash MD5. Idéal pour une répartition uniforme.
          </p>
        </button>

        {/* Ranged */}
        <button
          onClick={() => setStrategy('ranged')}
          className={`p-6 rounded-xl border-2 text-left transition-all cursor-pointer ${
            strategy === 'ranged'
              ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
          }`}
        >
          <ArrowDownUp size={28} className={strategy === 'ranged' ? 'text-purple-400' : 'text-slate-500'} />
          <h4 className={`font-bold mt-4 mb-2 text-lg ${strategy === 'ranged' ? 'text-white' : 'text-slate-300'}`}>
            Intervalle (Range)
          </h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            Distribution basée sur des intervalles numériques (ex: Âge 0-30, 31-60…).
          </p>
        </button>
      </div>

      {/* Range preview */}
      {strategy === 'ranged' && (
        <div className="mt-8 p-5 rounded-xl bg-slate-800/50 border border-slate-700">
          <p className="text-xs text-slate-400 mb-4 font-medium">Intervalles auto-générés :</p>
          <div className="flex gap-3">
            {shardLabels.map((label, i) => {
              const min = i * rangeStep;
              const max = i < numShards - 1 ? (i + 1) * rangeStep : 100;
              return (
                <div key={i} className="flex-1 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                  <div className="text-purple-400 font-bold text-sm">Shard {label}</div>
                  <div className="text-xs text-slate-400 mt-1">[{min}–{max})</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
