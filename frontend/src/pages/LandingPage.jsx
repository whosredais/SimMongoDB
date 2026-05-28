import Hero from '../components/landing/Hero';
import ConceptCard from '../components/landing/ConceptCard';
import Footer from '../components/landing/Footer';
import { Server, RefreshCw, LayoutGrid, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* ── Navigation Header ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Database size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-tight">
                SimMongo <span className="text-indigo-400">Edu</span>
              </span>
              <span className="text-[10px] text-slate-500 tracking-widest uppercase">Simulateur MongoDB</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#concepts" className="text-sm text-slate-400 hover:text-white transition-colors">Concepts</a>
            <a href="#about" className="text-sm text-slate-400 hover:text-white transition-colors">À propos</a>
            <button
              onClick={() => navigate('/wizard')}
              className="btn-glow px-5 py-2 rounded-lg text-white text-sm font-medium cursor-pointer"
            >
              Démarrer
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <Hero />

      {/* ── Concepts Section ── */}
      <section id="concepts" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium tracking-wider uppercase mb-6">
              Fondamentaux
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">
              Les <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">3 Piliers</span> de MongoDB
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Avant de plonger dans la simulation, découvrons les concepts fondamentaux qui font de MongoDB une base de données puissante et scalable.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <ConceptCard
              icon={<Server size={30} />}
              title="Le Nœud (Node)"
              description="Un nœud est une instance unique de MongoDB — un serveur qui stocke vos données. C'est la brique de base de toute architecture MongoDB. Chaque nœud possède sa propre copie des données."
              color="blue"
              delay="0.1s"
            />
            <ConceptCard
              icon={<RefreshCw size={30} />}
              title="Haute Disponibilité (Replica Set)"
              description="Un Replica Set est un groupe de nœuds identiques : 1 Primaire reçoit les écritures, les Secondaires maintiennent des copies de secours. Si le Primaire tombe, un Secondaire prend le relais automatiquement."
              color="amber"
              delay="0.25s"
            />
            <ConceptCard
              icon={<LayoutGrid size={30} />}
              title="Passage à l'Échelle (Sharding)"
              description="Le Sharding distribue les données sur plusieurs machines (Shards). Un Routeur (mongos) dirige les requêtes vers le bon Shard selon une clé de partitionnement. Cela permet de gérer des volumes massifs."
              color="emerald"
              delay="0.4s"
            />
          </div>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="py-28 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium tracking-wider uppercase mb-6">
            Notre Mission
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
            Pourquoi <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SimMongo Edu</span> ?
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-12 max-w-3xl mx-auto">
            MongoDB est l'une des bases de données les plus utilisées au monde, mais ses concepts d'architecture
            (Replica Sets, Sharding, Routage) peuvent sembler abstraits. <strong className="text-slate-200">SimMongo Edu</strong> vous
            permet de <strong className="text-indigo-300">construire, visualiser et casser</strong> un cluster MongoDB
            en temps réel — sans installer quoi que ce soit.
          </p>
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="glass-card p-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="text-3xl font-black text-indigo-400 mb-1">100%</div>
              <div className="text-xs text-slate-500 font-medium">Interactif</div>
            </div>
            <div className="glass-card p-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="text-3xl font-black text-amber-400 mb-1">0</div>
              <div className="text-xs text-slate-500 font-medium">Installation</div>
            </div>
            <div className="glass-card p-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="text-3xl font-black text-emerald-400 mb-1">∞</div>
              <div className="text-xs text-slate-500 font-medium">Apprentissage</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
