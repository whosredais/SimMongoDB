export default function ConceptCard({ icon, title, description, delay = '0s', color }) {
  const colorMap = {
    blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', glow: 'hover:shadow-blue-500/20' },
    amber: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'hover:shadow-amber-500/20' },
    emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'hover:shadow-emerald-500/20' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`animate-slide-up glass-card p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${c.glow}`}
      style={{ animationDelay: delay }}
    >
      {/* Icon container */}
      <div className={`w-16 h-16 rounded-2xl ${c.bg} ${c.border} border flex items-center justify-center mb-6`}>
        <span className={c.text}>{icon}</span>
      </div>

      {/* Title */}
      <h3 className={`text-xl font-bold mb-3 ${c.text}`}>{title}</h3>

      {/* Description */}
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
