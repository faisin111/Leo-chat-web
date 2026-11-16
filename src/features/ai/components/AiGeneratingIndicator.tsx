import { motion } from 'framer-motion';
import { Brain, Globe, Square } from 'lucide-react';
import { useAiStore } from '../store/ai.store';
import { AiRotatingIcon } from './AiRotatingIcon';

export const AiGeneratingIndicator = () => {
  const { isDeepThinkEnabled, isWebSearchEnabled, stopGeneration } = useAiStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full py-5 px-3 sm:px-6 bg-slate-900/40 dark:bg-slate-900/60 border-y border-slate-900/80 backdrop-blur-md"
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
              <span className="font-semibold text-xs text-white">LeoChat AI</span>

              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-slate-300 shadow-sm">
                {isDeepThinkEnabled ? (
                  <>
                    <Brain className="w-3 h-3 text-violet-400 animate-pulse" />
                    <span className="text-violet-300">Deep Reasoning active…</span>
                  </>
                ) : isWebSearchEnabled ? (
                  <>
                    <Globe className="w-3 h-3 text-sky-400 animate-pulse" />
                    <span className="text-sky-300">Searching live sources…</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    <span className="text-slate-200">Formulating response…</span>
                  </>
                )}
              </div>
            </div>

            {/* Stop Generation Button */}
            <button
              type="button"
              onClick={stopGeneration}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-[11px] font-medium transition-all cursor-pointer shadow-sm group"
              title="Stop generating"
            >
              <Square className="w-2.5 h-2.5 fill-current text-rose-400 group-hover:scale-110 transition-transform" />
              <span>Stop</span>
            </button>
          </div>

          {/* Fluid Aurora Shimmer Wave Lines */}
          <div className="space-y-2 pt-1">
            <div className="h-3 w-4/5 rounded-full bg-slate-800/60 relative overflow-hidden">
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/35 to-transparent w-full"
              />
            </div>

            <div className="h-3 w-11/12 rounded-full bg-slate-800/50 relative overflow-hidden">
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: 'linear', delay: 0.2 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/35 to-transparent w-full"
              />
            </div>

            <div className="h-3 w-3/5 rounded-full bg-slate-800/40 relative overflow-hidden">
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.3, repeat: Infinity, ease: 'linear', delay: 0.4 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-400/30 to-transparent w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
