import { motion } from 'framer-motion';
import { Brain, Globe, Square } from 'lucide-react';
import { useAiStore } from '../store/ai.store';
import { AiRotatingIcon } from './AiRotatingIcon';

export const AiGeneratingIndicator = () => {
  const { isDeepThinkEnabled, isWebSearchEnabled, stopGeneration } = useAiStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="w-full py-4 sm:py-5 px-3 sm:px-6 bg-zinc-50/60 dark:bg-zinc-900/40 border-y border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-sm"
    >
      <div className="max-w-3xl mx-auto flex items-start gap-3 sm:gap-4">
        {/* Modern Rotating AI Core Icon */}
        <div className="shrink-0 mt-0.5">
          <AiRotatingIcon size="md" />
        </div>

        {/* Dynamic Generating State Container */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Status Capsule */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-zinc-900 dark:text-white">
                LeoChat AI
              </span>

              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 shadow-sm">
                {isDeepThinkEnabled ? (
                  <>
                    <Brain className="w-3 h-3 text-zinc-800 dark:text-zinc-200 animate-pulse" />
                    <span>Deep Reasoning active…</span>
                  </>
                ) : isWebSearchEnabled ? (
                  <>
                    <Globe className="w-3 h-3 text-zinc-800 dark:text-zinc-200 animate-pulse" />
                    <span>Searching live sources…</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 dark:bg-zinc-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-900 dark:bg-white" />
                    </span>
                    <span>Thinking…</span>
                  </>
                )}
              </div>
            </div>

            {/* Stop Generation Button */}
            <button
              type="button"
              onClick={stopGeneration}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-[11px] font-medium transition-all cursor-pointer shadow-sm group"
              title="Stop generating"
            >
              <Square className="w-2.5 h-2.5 fill-current text-zinc-900 dark:text-white group-hover:scale-110 transition-transform" />
              <span>Stop</span>
            </button>
          </div>

          {/* Fluid Monochrome Shimmer Wave Lines */}
          <div className="space-y-2 pt-1">
            <div className="h-2.5 w-4/5 rounded-full bg-zinc-200 dark:bg-zinc-800/80 relative overflow-hidden">
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-zinc-600/50 to-transparent w-full"
              />
            </div>

            <div className="h-2.5 w-11/12 rounded-full bg-zinc-200/80 dark:bg-zinc-800/60 relative overflow-hidden">
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: 'linear', delay: 0.2 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-zinc-600/50 to-transparent w-full"
              />
            </div>

            <div className="h-2.5 w-3/5 rounded-full bg-zinc-200/60 dark:bg-zinc-800/40 relative overflow-hidden">
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.3, repeat: Infinity, ease: 'linear', delay: 0.4 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-zinc-600/50 to-transparent w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
