import React, { useState } from 'react';
import {
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
import { AiRotatingIcon } from './AiRotatingIcon';

interface AiSidebarProps {
  isMobile?: boolean;
}

export const AiSidebar = ({ isMobile = false }: AiSidebarProps) => {
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
    setSidebarOpen,
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

  if (!isSidebarOpen && !isMobile) {
    return null;
  }

  return (
    <aside
      className={`h-full flex flex-col bg-[#fcfcfc] dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800/80 z-30 transition-all duration-300 ${
        isMobile ? 'w-72 sm:w-80 shadow-2xl fixed inset-y-0 left-0' : 'w-64 md:w-72 shrink-0'
      }`}
    >
      {/* Top Header */}
      <div className="p-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AiRotatingIcon size="sm" />
          <div>
            <h2 className="font-bold text-sm text-zinc-900 dark:text-white tracking-tight leading-none flex items-center gap-1.5">
              <span>LeoChat AI</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                Beta
              </span>
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isMobile) {
              setSidebarOpen(false);
            } else {
              toggleSidebar();
            }
          }}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Close sidebar"
        >
          {isMobile ? <X className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Model Picker Selector */}
      <div className="p-3 border-b border-zinc-200/60 dark:border-zinc-800/60 relative">
        <button
          type="button"
          onClick={() => setIsModelDropdownOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-left transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center gap-2 min-w-0">
            {getModelIcon(selectedModel.icon)}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                  {selectedModel.name}
                </p>
                <span className="text-[9px] px-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {selectedModel.contextWindow}
                </span>
              </div>
            </div>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
              isModelDropdownOpen ? 'rotate-180 text-zinc-900 dark:text-white' : ''
            }`}
          />
        </button>

        {/* Model Dropdown Menu */}
        {isModelDropdownOpen && (
          <div className="absolute top-full left-3 right-3 mt-1.5 z-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2.5 py-1">
              Engine Model
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
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="pt-0.5">{getModelIcon(model.icon)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold">{model.name}</p>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 font-mono">
                      {model.contextWindow}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight pt-0.5">{model.tagline}</p>
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
          onClick={() => {
            createNewSession();
            if (isMobile) setSidebarOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-xs font-medium shadow-sm transition-all active:scale-[0.99] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search chats…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
          />
        </div>
      </div>

      {/* Session History List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800">
        {/* Pinned Sessions */}
        {pinnedSessions.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
              <Pin className="w-3 h-3 text-zinc-600 dark:text-zinc-400 rotate-45" />
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
                  onSelect={() => {
                    selectSession(session.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
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
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 mb-1.5">
            Recent
          </p>
          {recentSessions.length === 0 && pinnedSessions.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs">
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
                  onSelect={() => {
                    selectSession(session.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
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
      <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-black">
        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center font-bold">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-white text-[11px] leading-tight">
                LeoChat AI Pro
              </p>
              <p className="text-[10px] text-zinc-400">Unlimited Tokens</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
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
          ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium shadow-sm'
          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
      }`}
    >
      {isEditing ? (
        <form onSubmit={onSaveRename} className="flex-1 flex items-center gap-1 min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => onEditChange(e.target.value)}
            className="w-full text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded px-1.5 py-0.5 text-zinc-900 dark:text-white focus:outline-none"
          />
          <button
            type="button"
            onClick={onSaveRename}
            className="p-1 hover:text-zinc-900 dark:hover:text-white text-zinc-500 cursor-pointer"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onCancelRename}
            className="p-1 hover:text-rose-500 text-zinc-500 cursor-pointer"
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
            className={`w-3.5 h-3.5 shrink-0 ${
              isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
            }`}
          />
          <span className="truncate text-xs">{session.title}</span>
        </button>
      )}

      {/* Action Buttons on Hover */}
      {!isEditing && (
        <div className="hidden group-hover:flex items-center gap-1 shrink-0 pl-1 rounded">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            className={`p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer ${
              session.isPinned
                ? 'text-zinc-900 dark:text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
            title={session.isPinned ? 'Unpin chat' : 'Pin chat'}
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onStartRename}
            className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
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
            className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
            title="Delete conversation"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
