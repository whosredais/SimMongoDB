import { Heart, Database, Code2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/50 bg-[#0B1120]">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Database size={18} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm">SimMongo <span className="text-indigo-400">Edu</span></span>
              <p className="text-[11px] text-slate-600">Plateforme éducative MongoDB</p>
            </div>
          </div>

          {/* Tech stack */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <Code2 size={12} />
              <span>FastAPI</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <Code2 size={12} />
              <span>React + Vite</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <Code2 size={12} />
              <span>React Flow</span>
            </div>
          </div>

          {/* Love */}
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <span>Construit avec</span>
            <Heart size={14} className="text-red-400 fill-red-400" />
            <span>pour l'apprentissage</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-center">
          <p className="text-xs text-slate-600">© 2026 SimMongo Edu — Projet éducatif</p>
        </div>
      </div>
    </footer>
  );
}
