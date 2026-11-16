import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Brain, Globe, Paperclip, Mic, X, FileText, Sparkles, Square } from 'lucide-react';
import { useAiStore } from '../store/ai.store';
import { getModelById } from '../lib/ai-models';
import type { AiAttachment } from '../types/ai.types';
import { toast } from 'sonner';

export const AiComposer = () => {
  const [prompt, setPrompt] = useState('');
  const [attachments, setAttachments] = useState<AiAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isGenerating,
    selectedModelId,
    isDeepThinkEnabled,
    isWebSearchEnabled,
    sendMessage,
    stopGeneration,
    toggleDeepThink,
    toggleWebSearch,
  } = useAiStore();

  const selectedModel = getModelById(selectedModelId);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [prompt]);

  const handleSend = () => {
    if ((!prompt.trim() && attachments.length === 0) || isGenerating) return;
    sendMessage(prompt, attachments.length > 0 ? attachments : undefined);
    setPrompt('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: AiAttachment[] = Array.from(files).map((f) => ({
      id: `att-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      type: f.type,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    toast.success(`Attached ${files.length} file(s)`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 pb-4 sm:pb-6 relative z-20">
      <div className="rounded-3xl bg-slate-900/90 dark:bg-slate-950/90 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.65)] p-3 backdrop-blur-2xl transition-all">
        {/* Attachments Preview Pills */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2.5 px-2 border-b border-white/10 mb-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                <span className="text-[10px] text-slate-400">({att.size})</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask LeoChat AI anything… (Shift + Enter for new line)"
          rows={1}
          className="w-full bg-transparent resize-none text-xs sm:text-sm text-white placeholder-slate-400 px-2 py-1 focus:outline-none max-h-44 leading-relaxed"
        />

        {/* Bottom Toolbar & Mode Toggles */}
        <div className="flex items-center justify-between pt-2 px-1">
          {/* Left Feature Toggles */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Model Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-slate-300">
              <Sparkles className="w-3 h-3 text-primary" />
              <span>{selectedModel.name}</span>
            </span>

            {/* Deep Reasoning Toggle */}
            <button
              type="button"
              onClick={toggleDeepThink}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                isDeepThinkEnabled
                  ? 'bg-violet-500/25 text-violet-300 border border-violet-500/40 shadow-sm shadow-violet-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/10'
              }`}
              title="Toggle Deep Reasoning chain of thought"
            >
              <Brain
                className={`w-3.5 h-3.5 ${
                  isDeepThinkEnabled ? 'text-violet-400 animate-pulse' : ''
                }`}
              />
              <span className="hidden xs:inline">Reasoning</span>
            </button>

            {/* Live Web Search Toggle */}
            <button
              type="button"
              onClick={toggleWebSearch}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                isWebSearchEnabled
                  ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/10'
              }`}
              title="Search live web sources"
            >
              <Globe className={`w-3.5 h-3.5 ${isWebSearchEnabled ? 'text-sky-400' : ''}`} />
              <span className="hidden xs:inline">Web Search</span>
            </button>

            {/* File Attachment Button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Attach documents, images, or code"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5">
            {/* Mic Dictation */}
            <button
              type="button"
              onClick={() => toast.info('Voice dictation active')}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Send or Stop Generation Button */}
            {isGenerating ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white shadow-md border border-slate-700 transition-all cursor-pointer hover:scale-105 active:scale-95 group"
                title="Stop generating"
              >
                <Square className="w-3 h-3 fill-current text-rose-400 group-hover:scale-110 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!prompt.trim() && attachments.length === 0}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  prompt.trim() || attachments.length > 0
                    ? 'bg-gradient-to-tr from-primary via-violet-600 to-indigo-600 text-white shadow-md shadow-primary/30 hover:scale-105 active:scale-95'
                    : 'bg-white/10 text-slate-500 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 text-center pt-2">
        LeoChat AI may produce inaccurate info. Verify sensitive facts.
      </p>
    </div>
  );
};
