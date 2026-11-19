import { useRef, useEffect, useState } from 'react';
import {
  PanelLeft,
  Trash2,
  Share2,
  Plus,
  ChevronDown,
  Brain,
  Globe,
  Code,
  Zap,
} from 'lucide-react';
import { useAiStore } from '../store/ai.store';
import { AI_MODELS, getModelById } from '../lib/ai-models';
import type { AiModelId } from '../types/ai.types';
import { AiEmptyState } from './AiEmptyState';
import { AiMessageItem } from './AiMessageItem';
import { AiComposer } from './AiComposer';
import { AiGeneratingIndicator } from './AiGeneratingIndicator';
import { AiRotatingIcon } from './AiRotatingIcon';
import { toast } from 'sonner';

interface AiChatAreaProps {
  onOpenMobileSidebar?: () => void;
}

export const AiChatArea = ({ onOpenMobileSidebar }: AiChatAreaProps) => {
  const {
    sessions,
    activeSessionId,
    selectedModelId,
    isGenerating,
    generatingSessionId,
    isSidebarOpen,
    isDeepThinkEnabled,
    isWebSearchEnabled,
    toggleSidebar,
    createNewSession,
    setModel,
    deleteSession,
  } = useAiStore();

  const [isHeaderModelOpen, setIsHeaderModelOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const selectedModel = getModelById(selectedModelId);
  const messages = activeSession?.messages || [];
  const isGeneratingHere = isGenerating && generatingSessionId === activeSessionId;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isGeneratingHere]);

  // There is no shareable conversation URL, so copy the transcript instead.
  const handleShare = async () => {
    const transcript = messages
      .map((m) => `${m.role === 'user' ? 'You' : 'LeoChat AI'}:\n${m.content}`)
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(transcript);
      toast.success('Conversation copied to clipboard');
    } catch {
      toast.error('Could not copy conversation');
    }
  };

  const handleDelete = () => {
    if (!activeSessionId) return;
    if (window.confirm('Permanently delete this AI conversation and all its messages?')) {
      deleteSession(activeSessionId);
    }
  };

  const getModelIcon = (iconName: string) => {
    switch (iconName) {
      case 'brain':
        return <Brain className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />;
      case 'code':
        return <Code className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />;
      case 'zap':
        return <Zap className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />;
      case 'sparkles':
      default:
        return <AiRotatingIcon size="sm" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#000000] text-zinc-900 dark:text-zinc-100 relative overflow-hidden min-w-0 transition-colors">
      {/* Top Header Bar (ChatGPT & Gemini Style) */}
      <header className="h-14 border-b border-zinc-200/80 dark:border-zinc-800/80 px-3 sm:px-5 flex items-center justify-between z-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Open navigation menu"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Desktop Sidebar Toggle Button */}
          {!isSidebarOpen && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden md:flex p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Open sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          {/* ChatGPT Style Model Selector Dropdown in Header */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsHeaderModelOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white transition-colors cursor-pointer"
            >
              <span>{selectedModel.name}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
                  isHeaderModelOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Model Dropdown Menu */}
            {isHeaderModelOpen && (
              <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2 py-1">
                  Model Engine
                </p>
                {AI_MODELS.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      setModel(model.id as AiModelId);
                      setIsHeaderModelOpen(false);
                    }}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                      model.id === selectedModelId
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="pt-0.5">{getModelIcon(model.icon)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">{model.name}</p>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 font-mono">
                          {model.contextWindow}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-tight pt-0.5">
                        {model.tagline}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reasoning & Web Search Indicators */}
          <div className="hidden sm:flex items-center gap-1.5 pl-1">
            {isDeepThinkEnabled && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-1 border border-zinc-200 dark:border-zinc-700">
                <Brain className="w-3 h-3" />
                <span>Reasoning</span>
              </span>
            )}

            {isWebSearchEnabled && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-1 border border-zinc-200 dark:border-zinc-700">
                <Globe className="w-3 h-3" />
                <span>Search</span>
              </span>
            )}
          </div>
        </div>

        {/* Header Right Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* New Chat Button (Prominent ChatGPT style) */}
          <button
            type="button"
            onClick={() => createNewSession()}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-900 dark:text-white transition-colors cursor-pointer shadow-sm"
            title="Start new chat"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">New chat</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            disabled={messages.length === 0}
            className="p-2 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Copy conversation"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 rounded-xl text-zinc-500 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Delete conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800 flex flex-col">
        {messages.length === 0 ? (
          <AiEmptyState />
        ) : (
          <div className="flex-1 flex flex-col py-3 sm:py-4">
            {messages.map((msg, index) => (
              <AiMessageItem key={msg.id} message={msg} isLatest={index === messages.length - 1} />
            ))}

            {/* Modern AI Generation & Thinking State Indicator */}
            {isGeneratingHere && <AiGeneratingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Composer */}
      <AiComposer />
    </div>
  );
};
