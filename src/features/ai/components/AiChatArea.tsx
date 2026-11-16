import { useRef, useEffect } from 'react';
import { PanelLeftOpen, Sparkles, Trash2, Share2, Plus, Brain, Globe, Loader2 } from 'lucide-react';
import { useAiStore } from '../store/ai.store';
import { getModelById } from '../lib/ai-models';
import { AiEmptyState } from './AiEmptyState';
import { AiMessageItem } from './AiMessageItem';
import { AiComposer } from './AiComposer';
import { toast } from 'sonner';

export const AiChatArea = () => {
  const {
    sessions,
    activeSessionId,
    selectedModelId,
    isGenerating,
    isSidebarOpen,
    isDeepThinkEnabled,
    isWebSearchEnabled,
    toggleSidebar,
    createNewSession,
    clearActiveSessionMessages,
  } = useAiStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const selectedModel = getModelById(selectedModelId);
  const messages = activeSession?.messages || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isGenerating]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Conversation link copied to clipboard');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-white relative overflow-hidden min-w-0">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Top Header Bar */}
      <header className="h-14 sm:h-16 border-b border-slate-900/80 px-4 flex items-center justify-between z-20 bg-slate-950/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {!isSidebarOpen && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer mr-1"
              title="Open sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}

          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {activeSession ? activeSession.title : 'New AI Session'}
            </h2>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                <Sparkles className="w-2.5 h-2.5 text-primary" />
                <span>{selectedModel.name}</span>
              </span>

              {isDeepThinkEnabled && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-medium flex items-center gap-0.5">
                  <Brain className="w-2.5 h-2.5" />
                  <span>Reasoning</span>
                </span>
              )}

              {isWebSearchEnabled && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-medium flex items-center gap-0.5">
                  <Globe className="w-2.5 h-2.5" />
                  <span>Live Search</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Right Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => createNewSession()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition-colors cursor-pointer"
            title="Start new conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
            title="Share conversation"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearActiveSessionMessages}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
              title="Clear messages in this chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-slate-800 flex flex-col">
        {messages.length === 0 ? (
          <AiEmptyState />
        ) : (
          <div className="flex-1 flex flex-col py-4">
            {messages.map((msg, index) => (
              <AiMessageItem key={msg.id} message={msg} isLatest={index === messages.length - 1} />
            ))}

            {/* Thinking / Generating Pulse Indicator */}
            {isGenerating && (
              <div className="w-full py-4 sm:py-6 px-3 sm:px-6 bg-slate-900/30 border-y border-slate-900/40">
                <div className="max-w-3xl mx-auto flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary via-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary/25 shrink-0 animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span>
                        {isDeepThinkEnabled
                          ? 'Thinking & evaluating reasoning steps…'
                          : 'Generating response…'}
                      </span>
                    </div>
                    <div className="space-y-1.5 max-w-md">
                      <div className="h-2 bg-slate-800/80 rounded-full animate-pulse w-3/4" />
                      <div className="h-2 bg-slate-800/60 rounded-full animate-pulse w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Composer */}
      <AiComposer />
    </div>
  );
};
