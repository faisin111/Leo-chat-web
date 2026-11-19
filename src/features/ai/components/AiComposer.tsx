import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Brain, Globe, Plus, Mic, X, FileText, Square } from 'lucide-react';
import { useAiStore } from '../store/ai.store';
import type { AiAttachment } from '../types/ai.types';
import { toast } from 'sonner';

// The AI endpoint accepts text only, so attachments are read as text and sent in the prompt.
const MAX_ATTACHMENT_BYTES = 100 * 1024;
const TEXT_EXTENSIONS =
  /\.(txt|md|markdown|csv|tsv|json|xml|yaml|yml|log|ini|toml|html|css|js|jsx|ts|tsx|py|java|kt|go|rs|rb|php|c|h|cpp|cs|sh|sql)$/i;

const isTextFile = (file: File) =>
  file.type.startsWith('text/') ||
  ['application/json', 'application/xml', 'application/x-yaml'].includes(file.type) ||
  TEXT_EXTENSIONS.test(file.name);

// Minimal Web Speech API typing (not in the TS DOM lib).
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const getSpeechRecognition = (): SpeechRecognitionCtor | null => {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export const AiComposer = () => {
  const [prompt, setPrompt] = useState('');
  const [attachments, setAttachments] = useState<AiAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Stop dictation when the composer unmounts.
  useEffect(() => () => recognitionRef.current?.stop(), []);

  const toggleDictation = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      toast.error('Voice input is not supported in this browser');
      return;
    }
    const recognition = new Recognition();
    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim();
      if (transcript) {
        setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.onerror = () => {
      toast.error('Voice input failed. Check microphone permission.');
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const {
    isGenerating,
    isDeepThinkEnabled,
    isWebSearchEnabled,
    sendMessage,
    stopGeneration,
    toggleDeepThink,
    toggleWebSearch,
  } = useAiStore();

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (files.length === 0) return;

    const accepted: AiAttachment[] = [];
    for (const f of files) {
      if (!isTextFile(f)) {
        toast.error(`${f.name}: only text files can be sent to the AI`);
        continue;
      }
      if (f.size > MAX_ATTACHMENT_BYTES) {
        toast.error(`${f.name}: file is larger than 100 KB`);
        continue;
      }
      try {
        accepted.push({
          id: crypto.randomUUID(),
          name: f.name,
          size: `${(f.size / 1024).toFixed(1)} KB`,
          type: f.type,
          text: await f.text(),
        });
      } catch {
        toast.error(`${f.name}: could not be read`);
      }
    }

    if (accepted.length > 0) {
      setAttachments((prev) => [...prev, ...accepted]);
      toast.success(`Attached ${accepted.length} file(s)`);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 pb-3 sm:pb-6 relative z-20">
      <div className="rounded-[28px] bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-md dark:shadow-[0_15px_40px_rgba(0,0,0,0.5)] p-2.5 sm:p-3 backdrop-blur-2xl transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
        {/* Attachments Preview Pills */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2 px-1 border-b border-zinc-200 dark:border-zinc-800 mb-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                <span className="truncate max-w-[130px] font-medium">{att.name}</span>
                <span className="text-[10px] text-zinc-400">({att.size})</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
          maxLength={4000}
          placeholder="Message LeoChat AI… (Shift + Enter for new line)"
          rows={1}
          className="w-full bg-transparent resize-none text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 px-2.5 py-1.5 focus:outline-none max-h-44 leading-relaxed"
        />

        {/* Bottom Toolbar & Mode Toggles */}
        <div className="flex items-center justify-between pt-1 px-1">
          {/* Left Feature Toggles */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* File Attachment Button (+) */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept=".txt,.md,.markdown,.csv,.tsv,.json,.xml,.yaml,.yml,.log,.ini,.toml,.html,.css,.js,.jsx,.ts,.tsx,.py,.java,.kt,.go,.rs,.rb,.php,.c,.h,.cpp,.cs,.sh,.sql,text/*"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-7 h-7 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Add attachment"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Deep Reasoning Toggle */}
            <button
              type="button"
              onClick={toggleDeepThink}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                isDeepThinkEnabled
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
              title="Toggle Deep Reasoning chain of thought"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Reason</span>
            </button>

            {/* Live Web Search Toggle */}
            <button
              type="button"
              onClick={toggleWebSearch}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                isWebSearchEnabled
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
              title="Search live web sources"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5">
            {/* Mic Dictation */}
            <button
              type="button"
              onClick={toggleDictation}
              aria-pressed={isListening}
              className={`p-1.5 rounded-full transition-colors cursor-pointer hover:text-zinc-900 dark:hover:text-white ${
                isListening ? 'text-rose-500 animate-pulse' : 'text-zinc-500'
              }`}
              title={isListening ? 'Stop voice input' : 'Voice input'}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Send or Stop Generation Button (ChatGPT style) */}
            {isGenerating ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-black dark:bg-white text-white dark:text-black shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 group"
                title="Stop generating"
              >
                <Square className="w-3 h-3 fill-current group-hover:scale-110 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!prompt.trim() && attachments.length === 0}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  prompt.trim() || attachments.length > 0
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-md hover:scale-105 active:scale-95'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center pt-2">
        LeoChat AI may produce inaccurate info. Verify important facts.
      </p>
    </div>
  );
};
