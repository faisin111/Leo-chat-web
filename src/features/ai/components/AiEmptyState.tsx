import { Code2, Layers, Lightbulb, Compass, ArrowRight, Brain, Globe } from 'lucide-react';
import { useAiStore } from '../store/ai.store';
import { AiRotatingIcon } from './AiRotatingIcon';

const SUGGESTIONS = [
  {
    icon: <Code2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />,
    category: 'Code & Architecture',
    prompt:
      'Refactor a React 19 component with concurrent mode and custom hooks for peak performance',
    tag: 'TypeScript',
  },
  {
    icon: <Layers className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />,
    category: 'System Design',
    prompt: 'Design a WebRTC signaling architecture for group video calls',
    tag: 'High Scale',
  },
  {
    icon: <Lightbulb className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />,
    category: 'Product Strategy',
    prompt: 'Draft a launch checklist for a new chat app feature',
    tag: 'Product',
  },
  {
    icon: <Compass className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />,
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
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 max-w-3xl mx-auto w-full relative z-10 animate-in fade-in duration-300">
      {/* Central Rotating Icon Badge */}
      <div className="relative mb-6 flex items-center justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-lg dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <AiRotatingIcon size="lg" />
        </div>
      </div>

      {/* Hero Headings (ChatGPT & Gemini style) */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center tracking-tight text-zinc-900 dark:text-white mb-2">
        What can I help with today?
      </h1>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md mb-6 leading-relaxed">
        Ask anything, generate code, analyze architectures, or explore ideas with LeoChat AI.
      </p>

      {/* Feature Capabilities Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 shadow-sm">
          <Brain className="w-3.5 h-3.5" />
          <span>Reasoning mode</span>
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 shadow-sm">
          <Globe className="w-3.5 h-3.5" />
          <span>Web search</span>
        </span>
      </div>

      {/* Suggestion Starter Cards (Gemini & ChatGPT style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleCardClick(item.prompt)}
            className="group flex flex-col justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100/90 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-left transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.99]"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 border border-zinc-300/60 dark:border-zinc-700/60 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-white tracking-tight">
                    {item.category}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200/50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  {item.tag}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 leading-snug line-clamp-2">
                {item.prompt}
              </p>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-900 dark:text-white mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Try this prompt</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
