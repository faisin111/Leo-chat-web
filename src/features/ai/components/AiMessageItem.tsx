import { useEffect, useState, type ReactNode } from 'react';
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
  const isGenerating = useAiStore((s) => s.isGenerating);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speech if this message unmounts mid-utterance.
  useEffect(() => {
    return () => {
      if (isSpeaking) window.speechSynthesis?.cancel();
    };
  }, [isSpeaking]);

  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Read aloud is not supported in this browser');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(toPlainText(message.content));
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

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
                    href={safeUrl(src.url) ?? undefined}
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

            {isLatest && !isGenerating && (
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
              onClick={handleReadAloud}
              aria-pressed={isSpeaking}
              className={`p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer hover:text-zinc-900 dark:hover:text-white ${
                isSpeaking ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
              }`}
              title={isSpeaking ? 'Stop reading' : 'Read aloud'}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI output is untrusted: only allow http(s) targets (blocks javascript:, data:, etc.).
function safeUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : null;
  } catch {
    return null;
  }
}

function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' code block ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_#>]/g, '')
    .trim();
}

function renderInlineMarkdown(text: string): ReactNode {
  // Regex to match inline markdown:
  // 1: `code`
  // 2: **bold**
  // 3: *italic*
  // 4: [linkText](linkUrl)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (!part) return null;

    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-[11px] sm:text-xs font-mono text-zinc-900 dark:text-zinc-100 border border-zinc-300/60 dark:border-zinc-700/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-zinc-950 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic text-zinc-700 dark:text-zinc-300">
          {part.slice(1, -1)}
        </em>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    const linkHref = linkMatch?.[2] ? safeUrl(linkMatch[2]) : null;
    if (linkMatch && linkMatch[1] && !linkHref) {
      return <span key={idx}>{linkMatch[1]}</span>;
    }
    if (linkMatch && linkMatch[1] && linkHref) {
      return (
        <a
          key={idx}
          href={linkHref}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline font-medium inline-flex items-center gap-0.5 mx-0.5"
        >
          <span>{linkMatch[1]}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
        </a>
      );
    }

    return <span key={idx}>{part}</span>;
  });
}

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
              const trimmedP = paragraph.trim();
              if (!trimmedP) return null;

              // Check for markdown image: ![alt](url)
              const imgMatch = trimmedP.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
              const imgUrl = imgMatch?.[2] ? safeUrl(imgMatch[2]) : null;
              if (imgMatch && imgUrl) {
                const alt = imgMatch[1] || 'Generated image preview';
                const url = imgUrl;
                return (
                  <div
                    key={pIdx}
                    className="my-3 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-md group/img"
                  >
                    <div className="relative overflow-hidden aspect-video max-h-[420px] bg-zinc-950 flex items-center justify-center">
                      <img
                        src={url}
                        alt={alt}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-[1.02]"
                      />
                    </div>
                    {alt && (
                      <div className="p-2.5 px-3.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                        <span className="font-medium truncate">{alt}</span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <span>Full resolution</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              }

              // Check for headings
              if (trimmedP.startsWith('### ')) {
                return (
                  <h4
                    key={pIdx}
                    className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white pt-1.5 pb-0.5"
                  >
                    {renderInlineMarkdown(trimmedP.replace(/^###\s+/, ''))}
                  </h4>
                );
              }
              if (trimmedP.startsWith('## ')) {
                return (
                  <h3
                    key={pIdx}
                    className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white pt-2 pb-0.5"
                  >
                    {renderInlineMarkdown(trimmedP.replace(/^##\s+/, ''))}
                  </h3>
                );
              }
              if (trimmedP.startsWith('# ')) {
                return (
                  <h2
                    key={pIdx}
                    className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white pt-2 pb-1"
                  >
                    {renderInlineMarkdown(trimmedP.replace(/^#\s+/, ''))}
                  </h2>
                );
              }

              // Check for blockquote
              if (trimmedP.startsWith('> ')) {
                return (
                  <blockquote
                    key={pIdx}
                    className="border-l-2 border-zinc-400 dark:border-zinc-600 pl-3 italic text-zinc-600 dark:text-zinc-400 my-1 text-xs sm:text-sm"
                  >
                    {renderInlineMarkdown(trimmedP.replace(/^>\s*/, ''))}
                  </blockquote>
                );
              }

              // Check for bullet lists or lines
              const lines = trimmedP.split('\n');
              const isList =
                lines.length > 1 && lines.every((line) => /^[-*]\s+|\d+\.\s+/.test(line.trim()));

              if (isList) {
                return (
                  <ul key={pIdx} className="space-y-1.5 my-1 pl-1">
                    {lines.map((line, lIdx) => {
                      const isOrdered = /^\d+\.\s+/.test(line.trim());
                      const cleaned = line.trim().replace(/^[-*]\s+|\d+\.\s+/, '');
                      return (
                        <li
                          key={lIdx}
                          className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed"
                        >
                          <span className="text-zinc-400 dark:text-zinc-500 font-mono select-none pt-0.5">
                            {isOrdered ? `${lIdx + 1}.` : '•'}
                          </span>
                          <span className="flex-1 min-w-0">{renderInlineMarkdown(cleaned)}</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              return (
                <p key={pIdx} className="leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {lines.map((line, lIdx) => (
                    <span key={lIdx}>
                      {renderInlineMarkdown(line)}
                      {lIdx < lines.length - 1 && <br />}
                    </span>
                  ))}
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
