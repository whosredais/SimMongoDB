import { useState, useMemo } from 'react';
import { X, ChevronRight, RotateCcw, Trophy, CheckCircle2, XCircle, Brain } from 'lucide-react';

const QUESTIONS = [
  {
    q: "Quel est le rôle du routeur (mongos) dans un cluster MongoDB ?",
    opts: [
      "Stocker les données",
      "Diriger les requêtes vers le bon shard",
      "Répliquer les données entre nœuds",
      "Gérer les sauvegardes"
    ],
    answer: 1,
    explanation: "Le routeur mongos est le point d'entrée du cluster. Il analyse la clé de partitionnement et dirige chaque requête vers le shard approprié."
  },
  {
    q: "Qu'est-ce qu'un Replica Set dans MongoDB ?",
    opts: [
      "Un ensemble de bases de données différentes",
      "Un groupe de nœuds identiques avec 1 primaire et N secondaires",
      "Un mécanisme de compression des données",
      "Un type d'index"
    ],
    answer: 1,
    explanation: "Un Replica Set est un groupe de nœuds mongod qui maintiennent les mêmes données. Il comprend un primaire (écritures) et des secondaires (copies de secours)."
  },
  {
    q: "Que se passe-t-il quand un nœud Primaire tombe en panne ?",
    opts: [
      "Le cluster s'arrête complètement",
      "Les données sont perdues",
      "Un Secondaire est élu comme nouveau Primaire",
      "Le routeur crée un nouveau Primaire vide"
    ],
    answer: 2,
    explanation: "Grâce au mécanisme d'élection automatique, un nœud Secondaire est promu Primaire pour assurer la continuité du service. C'est la haute disponibilité !"
  },
  {
    q: "Comment fonctionne le partitionnement par hachage (Hash Sharding) ?",
    opts: [
      "Les données sont triées par date",
      "Un hash MD5 de la valeur détermine le shard cible",
      "Les données vont toujours au premier shard",
      "L'utilisateur choisit manuellement le shard"
    ],
    answer: 1,
    explanation: "Le Hash Sharding applique une fonction de hachage (ex: MD5) sur la clé de partitionnement. Le résultat modulo le nombre de shards détermine la destination."
  },
  {
    q: "Quelle est la différence principale entre le Range Sharding et le Hash Sharding ?",
    opts: [
      "Le Range est plus rapide",
      "Le Hash distribue uniformément, le Range permet des requêtes par intervalle",
      "Le Hash ne fonctionne qu'avec des nombres",
      "Il n'y a aucune différence"
    ],
    answer: 1,
    explanation: "Le Hash Sharding assure une distribution uniforme mais rend les requêtes par plage inefficaces. Le Range Sharding regroupe les données proches mais peut créer des hotspots."
  },
  {
    q: "Combien de nœuds Primaires un Replica Set peut-il avoir simultanément ?",
    opts: [
      "Autant que nécessaire",
      "Exactement 2",
      "Exactement 1",
      "Aucun, les écritures vont directement aux Secondaires"
    ],
    answer: 2,
    explanation: "Un Replica Set ne peut avoir qu'un seul Primaire à la fois. C'est lui qui reçoit toutes les opérations d'écriture et les réplique vers les Secondaires."
  },
  {
    q: "Que fait un nœud Secondaire quand il est réparé après une panne ?",
    opts: [
      "Il redevient automatiquement Primaire",
      "Il rejoint le cluster comme Secondaire et se resynchronise",
      "Il crée un nouveau Replica Set",
      "Il supprime toutes ses données"
    ],
    answer: 1,
    explanation: "Un nœud réparé revient en tant que Secondaire et copie les données du Primaire actuel pour se remettre à jour. Il ne reprend pas automatiquement le rôle de Primaire."
  },
  {
    q: "Pourquoi utilise-t-on le Sharding dans MongoDB ?",
    opts: [
      "Pour sécuriser les données",
      "Pour distribuer les données sur plusieurs machines et gérer de gros volumes",
      "Pour compresser les données",
      "Pour créer des sauvegardes"
    ],
    answer: 1,
    explanation: "Le Sharding (partitionnement horizontal) permet de distribuer les données sur plusieurs serveurs, augmentant ainsi la capacité de stockage et les performances de lecture/écriture."
  },
  {
    q: "Dans un cluster shardé, où sont stockées les métadonnées de routage ?",
    opts: [
      "Dans chaque shard",
      "Dans le Config Server (utilisé par le routeur mongos)",
      "Dans un fichier local",
      "Nulle part, elles sont calculées à la volée"
    ],
    answer: 1,
    explanation: "Les Config Servers stockent les métadonnées du cluster (quels chunks sur quels shards). Le routeur mongos consulte ces métadonnées pour diriger les requêtes."
  },
  {
    q: "Si tous les Secondaires d'un shard tombent en panne, que se passe-t-il ?",
    opts: [
      "Le shard est complètement hors service",
      "Le Primaire continue de fonctionner seul mais sans réplication",
      "Les données sont automatiquement migrées",
      "MongoDB crée de nouveaux Secondaires"
    ],
    answer: 1,
    explanation: "Le Primaire peut continuer à accepter des écritures, mais il n'y a plus de réplication — les données ne sont plus protégées contre une panne du Primaire."
  }
];

const BADGES = [
  { min: 0, max: 3, label: 'Bronze', emoji: '🥉', color: '#CD7F32', gradient: 'from-amber-700 to-amber-900' },
  { min: 4, max: 6, label: 'Argent', emoji: '🥈', color: '#C0C0C0', gradient: 'from-slate-300 to-slate-500' },
  { min: 7, max: 8, label: 'Or', emoji: '🥇', color: '#FFD700', gradient: 'from-yellow-400 to-amber-500' },
  { min: 9, max: 10, label: 'Platine', emoji: '💎', color: '#A78BFA', gradient: 'from-violet-400 to-purple-600' },
];

function getBadge(score) {
  return BADGES.find(b => score >= b.min && score <= b.max) || BADGES[0];
}

export default function QuizModal({ onClose }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  const question = QUESTIONS[current];
  const score = useMemo(() => answers.filter(a => a.correct).length, [answers]);
  const badge = useMemo(() => getBadge(score), [score]);

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    setAnswers(prev => [...prev, { qIdx: current, chosen: idx, correct: idx === question.answer }]);
  };

  const handleNext = () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setAnswers([]);
    setFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 rounded-2xl bg-[#0F172A] border border-slate-700/50 shadow-2xl shadow-indigo-500/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Quiz MongoDB</h2>
              <p className="text-xs text-slate-500">Testez votre compréhension</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {!finished ? (
          <div className="p-6">
            {/* Progress */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${((current + (answered ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 font-mono shrink-0">
                {current + 1}/{QUESTIONS.length}
              </span>
            </div>

            {/* Question */}
            <div className="mb-6 animate-slide-up" key={current}>
              <h3 className="text-lg font-bold text-white mb-1">Question {current + 1}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{question.q}</p>
            </div>

            {/* Options */}
            <div className="space-y-2.5 mb-6">
              {question.opts.map((opt, i) => {
                let cls = 'border-slate-700 bg-slate-800/50 hover:border-slate-500 text-slate-300';
                if (answered) {
                  if (i === question.answer) cls = 'border-emerald-500 bg-emerald-500/15 text-emerald-300';
                  else if (i === selected && i !== question.answer) cls = 'border-red-500 bg-red-500/15 text-red-300';
                  else cls = 'border-slate-700/50 bg-slate-800/30 text-slate-500';
                } else if (i === selected) {
                  cls = 'border-indigo-500 bg-indigo-500/10 text-indigo-300';
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={answered}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer flex items-center gap-3 ${cls}`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-700/50 flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {answered && i === question.answer && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                    {answered && i === selected && i !== question.answer && <XCircle size={18} className="text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {answered && (
              <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 animate-slide-up">
                <p className="text-xs font-bold text-indigo-400 mb-1">💡 Explication</p>
                <p className="text-sm text-slate-300 leading-relaxed">{question.explanation}</p>
              </div>
            )}

            {/* Next button */}
            {answered && (
              <button
                onClick={handleNext}
                className="btn-glow w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 cursor-pointer animate-fade-in"
              >
                {current < QUESTIONS.length - 1 ? (
                  <>Suivant <ChevronRight size={16} /></>
                ) : (
                  <>Voir mon score <Trophy size={16} /></>
                )}
              </button>
            )}
          </div>
        ) : (
          /* ── Score Screen ── */
          <div className="p-8 text-center">
            {/* Confetti particles */}
            <div className="confetti-container">
              {score >= 7 && Array.from({length: 30}).map((_, i) => (
                <div key={i} className="confetti-piece" style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  background: ['#6366F1','#8B5CF6','#EC4899','#F59E0B','#10B981','#3B82F6'][i % 6],
                }} />
              ))}
            </div>

            <div className="score-reveal-anim">
              {/* Badge */}
              <div className={`w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center bg-gradient-to-br ${badge.gradient} shadow-lg`}
                   style={{ boxShadow: `0 0 40px ${badge.color}40` }}>
                <span className="text-4xl">{badge.emoji}</span>
              </div>

              <h2 className="text-3xl font-black text-white mb-1">
                {score}/{QUESTIONS.length}
              </h2>
              <p className="text-lg font-bold mb-2" style={{ color: badge.color }}>
                Badge {badge.label}
              </p>
              <p className="text-sm text-slate-400 mb-8">
                {score <= 3 && "Continuez à explorer le simulateur pour mieux comprendre les concepts !"}
                {score >= 4 && score <= 6 && "Bon travail ! Vous maîtrisez les bases, continuez à approfondir."}
                {score >= 7 && score <= 8 && "Excellent ! Vous avez une très bonne compréhension de MongoDB."}
                {score >= 9 && "Parfait ! Vous êtes un expert MongoDB ! 🎉"}
              </p>
            </div>

            {/* Recap */}
            <div className="text-left space-y-2 mb-6 max-h-[280px] overflow-y-auto pr-1">
              {answers.map((a, i) => (
                <div key={i} className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-xs ${
                  a.correct ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  {a.correct ? <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" /> : <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${a.correct ? 'text-emerald-300' : 'text-red-300'}`}>
                      Q{i+1}: {QUESTIONS[a.qIdx].q.slice(0, 60)}...
                    </p>
                    {!a.correct && (
                      <p className="text-slate-400 mt-0.5">
                        Réponse: {QUESTIONS[a.qIdx].opts[QUESTIONS[a.qIdx].answer]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleRestart}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-all cursor-pointer text-sm font-medium flex items-center justify-center gap-2">
                <RotateCcw size={15} /> Recommencer
              </button>
              <button onClick={onClose}
                className="flex-1 btn-glow px-4 py-3 rounded-xl text-white text-sm font-medium cursor-pointer">
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
