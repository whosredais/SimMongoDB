import { useNavigate } from 'react-router-dom';
import { Database, Rocket, ArrowDown } from 'lucide-react';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Badge */}
      <div className="animate-fade-in flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8">
        <Database size={16} />
        <span>Plateforme Éducative MongoDB</span>
      </div>

      {/* Title */}
      <h1 className="animate-slide-up text-5xl md:text-7xl font-black text-center leading-tight max-w-4xl mb-6">
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          SimMongo
        </span>
        <span className="text-white"> Edu</span>
      </h1>

      {/* Subtitle */}
      <p className="animate-slide-up text-lg md:text-xl text-slate-400 text-center max-w-2xl mb-4" style={{ animationDelay: '0.15s' }}>
        Comprenez visuellement l'architecture de MongoDB — <br className="hidden md:block" />
        Replica Sets, Sharding & Haute Disponibilité — sans écrire une ligne de code.
      </p>

      <p className="animate-slide-up text-sm text-slate-500 text-center max-w-xl mb-10" style={{ animationDelay: '0.25s' }}>
        Une simulation interactive et pédagogique pour démystifier le Big Data.
      </p>

      {/* CTA Button */}
      <button
        id="cta-start-simulation"
        onClick={() => navigate('/wizard')}
        className="animate-slide-up btn-glow text-white font-semibold px-8 py-4 rounded-xl text-lg flex items-center gap-3 cursor-pointer"
        style={{ animationDelay: '0.35s' }}
      >
        <Rocket size={22} />
        Démarrer la Simulation
      </button>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 flex flex-col items-center gap-2 text-slate-500 animate-float">
        <span className="text-xs tracking-widest uppercase">Découvrir</span>
        <ArrowDown size={18} />
      </div>
    </section>
  );
}
