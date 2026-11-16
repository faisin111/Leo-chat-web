import { useState } from 'react';
import {
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
import { AiRotatingIcon } from './AiRotatingIcon';
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

  // User Message (ChatGPT / Gemini style right-aligned bubble)
  if (isUser) {
    return (
      <div className="w-full py-2.5 sm:py-3.5 px-3 sm:px-6">
        <div className="max-w-3xl mx-auto flex justify-end">
          <div className="max-w-[88%] sm:max-w-[78%] bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-3xl px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm leading-relaxed shadow-sm border border-zinc-200/70 dark:border-zinc-700/60 break-words whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message (ChatGPT / Gemini style full-width response)
  return (
    <div className="w-full py-4 sm:py-6 px-3 sm:px-6 group">
      <div className="max-w-3xl mx-auto flex items-start gap-3 sm:gap-4">
        {/* Modern Rotating AI Core Icon */}
        <div className="shrink-0 mt-0.5">
          <AiRotatingIcon size="md" />
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Header Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white">
                LeoChat AI
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-mono">
                {message.modelId === 'leo-reasoner' ? 'Reasoning R1' : '4.5 Ultra'}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Deep Thinking / Reasoning Disclosure (o1 / R1 style) */}
          {message.thinkingContent && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden text-xs my-2">
              <button
                type="button"
                onClick={() => setIsThinkingExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="font-medium text-[11px]">
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
                <div className="px-3.5 pb-3 pt-1 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 whitespace-pre-wrap leading-relaxed">
                  {message.thinkingContent}
                </div>
              )}
            </div>
          )}

          {/* Formatted Markdown & Prose */}
          <div className="text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            <FormattedMarkdown content={message.content} />
          </div>

          {/* Web Sources Citations */}
          {message.sources && message.sources.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Globe className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                <span>Sources & Citations</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] transition-colors"
                  >
                    <span className="truncate max-w-[180px]">{src.title}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Assistant Actions Bar (ChatGPT style hover tools) */}
          <div className="flex items-center gap-1 pt-1.5 text-zinc-400 dark:text-zinc-500 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleCopyContent}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] transition-colors cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              title="Copy response"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleFeedback('like')}
              className={`p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                feedback === 'like'
                  ? 'text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-700'
                  : ''
              }`}
              title="Good response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleFeedback('dislike')}
              className={`p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                feedback === 'dislike'
                  ? 'text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-700'
                  : ''
              }`}
              title="Bad response"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>

            {isLatest && (
              <button
                type="button"
                onClick={() => regenerateResponse(message.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] transition-colors cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                title="Regenerate response"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => toast.info('Read aloud feature initialized')}
              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              title="Read aloud"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Safe Markdown and Code Block Formatter
const FormattedMarkdown = ({ content }: { content: string }) => {
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

        return (
          <div key={index} className="space-y-2">
            {part.split('\n\n').map((paragraph, pIdx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h4
                    key={pIdx}
                    className="text-sm font-semibold text-zinc-900 dark:text-white pt-1"
                  >
                    {paragraph.replace('### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h3 key={pIdx} className="text-base font-bold text-zinc-900 dark:text-white pt-1">
                    {paragraph.replace('## ', '')}
                  </h3>
                );
              }

              return (
                <p key={pIdx} className="whitespace-pre-line text-zinc-800 dark:text-zinc-200">
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
    <div className="my-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 dark:bg-black overflow-hidden shadow-md text-xs text-white">
      <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-800/80 dark:bg-zinc-900/90 border-b border-zinc-700/60 dark:border-zinc-800 text-zinc-300">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-zinc-400" />
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

      <pre className="p-3.5 sm:p-4 overflow-x-auto text-[12px] font-mono leading-relaxed text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};
