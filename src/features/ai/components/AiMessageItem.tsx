import { useState } from 'react';
import {
  Sparkles,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  Volume2,
  ChevronDown,
  Brain,
  Globe,
  ExternalLink,
  Code2,
} from 'lucide-react';
import type { AiMessage } from '../types/ai.types';
import { useAiStore } from '../store/ai.store';
import { toast } from 'sonner';

interface AiMessageItemProps {
  message: AiMessage;
  isLatest: boolean;
}

export const AiMessageItem = ({ message, isLatest }: AiMessageItemProps) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const regenerateResponse = useAiStore((s) => s.regenerateResponse);

  const handleCopyContent = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    if (feedback === type) {
      setFeedback(null);
    } else {
      setFeedback(type);
      toast.success(type === 'like' ? 'Feedback recorded! Thank you.' : 'Feedback recorded.');
    }
  };

  return (
    <div
      className={`w-full py-4 sm:py-6 px-3 sm:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-slate-900/40 dark:bg-slate-900/50 border-y border-slate-900/60'
      }`}
    >
      <div className="max-w-3xl mx-auto flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shadow-sm">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary via-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary/25">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Header Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs sm:text-sm text-white">
                {isUser ? 'You' : 'LeoChat AI'}
              </span>
              {!isUser && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 font-mono">
                  {message.modelId === 'leo-reasoner' ? 'Reasoning R1' : '4.5 Ultra'}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Deep Thinking / Reasoning Disclosure */}
          {message.thinkingContent && (
            <div className="rounded-xl border border-violet-500/25 bg-violet-950/20 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setIsThinkingExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 text-violet-300 hover:text-violet-200 transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                  <span className="font-semibold text-[11px]">
                    Thought for {message.thinkingDurationSecs || 3.2} seconds
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isThinkingExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isThinkingExpanded && (
                <div className="px-3 pb-3 pt-1 text-[11px] font-mono text-slate-400 border-t border-violet-500/20 whitespace-pre-wrap leading-relaxed">
                  {message.thinkingContent}
                </div>
              )}
            </div>
          )}

          {/* Formatted Markdown & Prose */}
          <div className="text-xs sm:text-sm leading-relaxed text-slate-200">
            <FormattedMarkdown content={message.content} />
          </div>

          {/* Web Sources Citations */}
          {message.sources && message.sources.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Globe className="w-3 h-3 text-sky-400" />
                <span>Sources & Citations</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] transition-colors"
                  >
                    <span className="truncate max-w-[180px]">{src.title}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Assistant Actions Bar */}
          {!isUser && (
            <div className="flex items-center gap-1 pt-2 text-slate-400">
              <button
                type="button"
                onClick={handleCopyContent}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-800 text-[11px] transition-colors cursor-pointer"
                title="Copy response"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleFeedback('like')}
                className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors cursor-pointer ${
                  feedback === 'like' ? 'text-emerald-400 bg-emerald-500/10' : ''
                }`}
                title="Good response"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleFeedback('dislike')}
                className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors cursor-pointer ${
                  feedback === 'dislike' ? 'text-rose-400 bg-rose-500/10' : ''
                }`}
                title="Bad response"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              {isLatest && (
                <button
                  type="button"
                  onClick={() => regenerateResponse(message.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-800 text-[11px] transition-colors cursor-pointer"
                  title="Regenerate response"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => toast.info('Read aloud feature initialized')}
                className="p-1.5 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                title="Read aloud"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Safe Markdown and Code Block Formatter
const FormattedMarkdown = ({ content }: { content: string }) => {
  // Parse code blocks with ```lang ... ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const match = part.match(/^```(\w+)?\n([\s\S]*?)```$/);
          const lang = match ? match[1] || 'code' : 'code';
          const code = match && match[2] ? match[2] : part.slice(3, -3);

          return <CodeSnippet key={index} lang={lang} code={code} />;
        }

        // Render plain text with paragraphs and bullets
        return (
          <div key={index} className="space-y-2">
            {part.split('\n\n').map((paragraph, pIdx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h4 key={pIdx} className="text-sm font-bold text-white pt-1">
                    {paragraph.replace('### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h3 key={pIdx} className="text-base font-bold text-white pt-1">
                    {paragraph.replace('## ', '')}
                  </h3>
                );
              }

              return (
                <p key={pIdx} className="whitespace-pre-line text-slate-300">
                  {paragraph}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const CodeSnippet = ({ lang, code }: { lang: string; code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl text-xs">
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-slate-400">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-[11px] font-semibold uppercase">{lang}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span>{copied ? 'Copied' : 'Copy code'}</span>
        </button>
      </div>

      <pre className="p-3.5 sm:p-4 overflow-x-auto text-[12px] font-mono leading-relaxed text-slate-300">
        <code>{code}</code>
      </pre>
    </div>
  );
};
