import { motion } from 'framer-motion';
import {
  Sparkles,
  Code2,
  Layers,
  Lightbulb,
  Compass,
  ArrowRight,
  Brain,
  Globe,
  Shield,
} from 'lucide-react';
import { useAiStore } from '../store/ai.store';

const SUGGESTIONS = [
  {
    icon: <Code2 className="w-4 h-4 text-emerald-400" />,
    category: 'Code & Architecture',
    prompt:
      'Refactor a React 19 component with concurrent mode and custom hooks for peak performance',
    tag: 'TypeScript',
  },
  {
    icon: <Layers className="w-4 h-4 text-violet-400" />,
    category: 'System Design',
    prompt: 'Design a distributed WebRTC signaling architecture supporting 10,000 concurrent calls',
    tag: 'High Scale',
  },
  {
    icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
    category: 'Product Strategy',
    prompt: 'Draft an executive launch checklist and viral feature hooks for LeoChat 2.0',
    tag: 'Product',
  },
  {
    icon: <Compass className="w-4 h-4 text-sky-400" />,
    category: 'Deep Explanation',
    prompt:
      'Explain Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (zk-SNARKs) with analogies',
    tag: 'Cryptography',
  },
];

export const AiEmptyState = () => {
  const sendMessage = useAiStore((s) => s.sendMessage);

  const handleCardClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-3xl mx-auto w-full relative z-10 animate-in fade-in duration-300">
      {/* Central Animated Holographic AI Orb */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Expanding ambient aura */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-primary via-violet-600 to-indigo-500 blur-2xl pointer-events-none"
        />

        {/* Orbiting sparkles */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-primary via-violet-600 to-indigo-600 p-[1.5px] shadow-[0_10px_35px_rgba(244,63,94,0.4)]">
          <div className="w-full h-full bg-slate-950/90 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-transparent bg-clip-text bg-gradient-to-tr from-primary via-violet-400 to-sky-300 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Hero Headings */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-center tracking-tight text-white mb-2">
        How can LeoChat AI help you today?
      </h1>
      <p className="text-xs sm:text-sm text-slate-400 text-center max-w-md mb-6 leading-relaxed">
        Your intelligent copilot for rapid full-stack engineering, complex reasoning, research, and
        creative brainstorming.
      </p>

      {/* Feature Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-slate-300 shadow-sm">
          <Brain className="w-3.5 h-3.5 text-violet-400" />
          <span>Deep Reasoning R1</span>
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-slate-300 shadow-sm">
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>Live Web Search</span>
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-slate-300 shadow-sm">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Workspace</span>
        </span>
      </div>

      {/* Suggestion Starter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleCardClick(item.prompt)}
            className="group flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-primary/40 text-left transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-primary/10 cursor-pointer active:scale-[0.98]"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-xs font-semibold text-white tracking-tight">
                    {item.category}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                  {item.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400 group-hover:text-slate-200 leading-snug line-clamp-2">
                {item.prompt}
              </p>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-medium text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Execute prompt</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
