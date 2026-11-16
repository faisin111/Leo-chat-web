import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronDown,
  Cpu,
  Brain,
  Code,
  Zap,
  PanelLeftClose,
} from 'lucide-react';
import { useAiStore } from '../store/ai.store';
import { AI_MODELS, getModelById } from '../lib/ai-models';
import type { AiModelId } from '../types/ai.types';

export const AiSidebar = () => {
  const {
    sessions,
    activeSessionId,
    selectedModelId,
    isSidebarOpen,
    createNewSession,
    selectSession,
    deleteSession,
    renameSession,
    togglePinSession,
    setModel,
    toggleSidebar,
  } = useAiStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const selectedModel = getModelById(selectedModelId);

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const recentSessions = filteredSessions.filter((s) => !s.isPinned);

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const getModelIcon = (iconName: string) => {
    switch (iconName) {
      case 'brain':
        return <Brain className="w-4 h-4 text-violet-400" />;
      case 'code':
        return <Code className="w-4 h-4 text-emerald-400" />;
      case 'zap':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'sparkles':
      default:
        return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <aside className="w-72 sm:w-80 h-full flex flex-col bg-slate-950/90 dark:bg-slate-950/95 border-r border-slate-900/80 backdrop-blur-xl shrink-0 z-20 transition-all duration-300">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary via-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white tracking-tight leading-none flex items-center gap-1.5">
              <span>LeoChat AI</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                Beta
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 pt-0.5">Intelligent Copilot</p>
          </div>
        </div>

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Model Picker Selector */}
      <div className="p-3 border-b border-slate-900/60 relative">
        <button
          type="button"
          onClick={() => setIsModelDropdownOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 text-left transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {getModelIcon(selectedModel.icon)}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-white truncate">{selectedModel.name}</p>
                <span className="text-[9px] px-1 rounded bg-white/10 text-slate-300">
                  {selectedModel.contextWindow}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{selectedModel.tagline}</p>
            </div>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              isModelDropdownOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>

        {/* Model Dropdown Menu */}
        {isModelDropdownOpen && (
          <div className="absolute top-full left-3 right-3 mt-1.5 z-40 bg-slate-900/95 border border-slate-800/90 rounded-2xl shadow-2xl p-1.5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2.5 py-1">
              Select Intelligence Engine
            </p>
            {AI_MODELS.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  setModel(model.id as AiModelId);
                  setIsModelDropdownOpen(false);
                }}
                className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                  model.id === selectedModelId
                    ? 'bg-primary/20 text-white border border-primary/30'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <div className="pt-0.5">{getModelIcon(model.icon)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-white">{model.name}</p>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300 font-mono">
                      {model.contextWindow}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight pt-0.5">{model.tagline}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Chat Button & Search */}
      <div className="p-3 space-y-2">
        <button
          type="button"
          onClick={() => createNewSession()}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary via-violet-600 to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-primary/25 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search AI conversations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/60 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Session History List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Pinned Sessions */}
        {pinnedSessions.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
              <Pin className="w-3 h-3 text-amber-400 rotate-45" />
              <span>Pinned</span>
            </p>
            <div className="space-y-1">
              {pinnedSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={session.id === activeSessionId}
                  isEditing={editingId === session.id}
                  editTitle={editTitle}
                  onSelect={() => selectSession(session.id)}
                  onDelete={() => deleteSession(session.id)}
                  onTogglePin={() => togglePinSession(session.id)}
                  onStartRename={(e) => handleStartRename(session.id, session.title, e)}
                  onSaveRename={(e) => handleSaveRename(session.id, e)}
                  onCancelRename={(e) => {
                    e.stopPropagation();
                    setEditingId(null);
                  }}
                  onEditChange={(val) => setEditTitle(val)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Conversations */}
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1.5">
            Recent Chats
          </p>
          {recentSessions.length === 0 && pinnedSessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p>No conversations found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={session.id === activeSessionId}
                  isEditing={editingId === session.id}
                  editTitle={editTitle}
                  onSelect={() => selectSession(session.id)}
                  onDelete={() => deleteSession(session.id)}
                  onTogglePin={() => togglePinSession(session.id)}
                  onStartRename={(e) => handleStartRename(session.id, session.title, e)}
                  onSaveRename={(e) => handleSaveRename(session.id, e)}
                  onCancelRename={(e) => {
                    e.stopPropagation();
                    setEditingId(null);
                  }}
                  onEditChange={(val) => setEditTitle(val)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Pro Badge */}
      <div className="p-3 border-t border-slate-900/80 bg-slate-950/60">
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-primary/15 via-violet-600/15 to-indigo-600/15 border border-primary/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white text-[11px] leading-tight">LeoChat Pro AI</p>
              <p className="text-[10px] text-slate-400">Unlimited Tokens • Live Web</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Active
          </span>
        </div>
      </div>
    </aside>
  );
};

interface SessionItemProps {
  session: { id: string; title: string; isPinned?: boolean };
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onStartRename: (e: React.MouseEvent) => void;
  onSaveRename: (e: React.MouseEvent | React.FormEvent) => void;
  onCancelRename: (e: React.MouseEvent) => void;
  onEditChange: (val: string) => void;
}

const SessionItem = ({
  session,
  isActive,
  isEditing,
  editTitle,
  onSelect,
  onDelete,
  onTogglePin,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onEditChange,
}: SessionItemProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all ${
        isActive
          ? 'bg-slate-900 text-white font-medium border border-slate-800 shadow-sm'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
      }`}
    >
      {isEditing ? (
        <form onSubmit={onSaveRename} className="flex-1 flex items-center gap-1 min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => onEditChange(e.target.value)}
            className="w-full text-xs bg-slate-950 border border-primary/50 rounded px-1.5 py-0.5 text-white focus:outline-none"
          />
          <button
            type="button"
            onClick={onSaveRename}
            className="p-1 hover:text-emerald-400 text-slate-400 cursor-pointer"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onCancelRename}
            className="p-1 hover:text-rose-400 text-slate-400 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={onSelect}
          className="flex items-center gap-2 min-w-0 flex-1 pr-1 text-left cursor-pointer focus:outline-none"
        >
          <MessageSquare
            className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-slate-500'}`}
          />
          <span className="truncate text-xs">{session.title}</span>
        </button>
      )}

      {/* Action Buttons on Hover */}
      {!isEditing && (
        <div className="hidden group-hover:flex items-center gap-1 shrink-0 bg-slate-900/90 pl-1 rounded">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            className={`p-1 rounded hover:bg-white/10 cursor-pointer ${
              session.isPinned ? 'text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
            title={session.isPinned ? 'Unpin chat' : 'Pin chat'}
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onStartRename}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            title="Rename"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/10 cursor-pointer"
            title="Delete conversation"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
