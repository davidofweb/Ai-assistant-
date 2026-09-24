import React, { useState } from 'react';
import { Message } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { Copy, Check, RotateCcw, User, Terminal } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  modelName: string;
  showTimestamps: boolean;
  isLast: boolean;
  isGenerating: boolean;
  onRegenerate?: () => void;
}

export default function MessageItem({
  message,
  modelName,
  showTimestamps,
  isLast,
  isGenerating,
  onRegenerate,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`group w-full max-w-4xl mx-auto flex gap-3 sm:gap-6 p-3.5 sm:p-6 rounded-2xl border transition-all duration-300 ${
        isUser
          ? 'bg-zinc-900/20 border-zinc-900/40'
          : 'bg-zinc-900/60 border-zinc-800/80 shadow-md'
      }`}
    >
      {/* Icon / Avatar Zone */}
      <div
        className={`w-8 sm:w-10 h-8 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
          isUser
            ? 'bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-zinc-700/50 text-zinc-300'
            : 'bg-gradient-to-tr from-indigo-950 to-indigo-900 border border-indigo-800/50 text-indigo-400'
        }`}
      >
        {isUser ? (
          <User className="w-3.5 sm:w-5 h-3.5 sm:h-5" />
        ) : (
          <Terminal className="w-3.5 sm:w-5 h-3.5 sm:h-5 animate-pulse" />
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 space-y-2.5 min-w-0">
        {/* Unboxed Metadata & Headers (Zero-Pill Discipline) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-zinc-500 font-medium tracking-wide min-w-0">
            <span className={`truncate ${isUser ? 'text-zinc-400' : 'text-indigo-400 font-semibold'}`}>
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            {!isUser && (
              <>
                <span className="text-zinc-400 font-light truncate">{modelName}</span>
                <span aria-hidden="true" className="text-zinc-700">·</span>
              </>
            )}
            {showTimestamps && (
              <span className="text-zinc-500 font-mono text-[9px] sm:text-[10px] tabular-nums shrink-0">
                {formatTimestamp(message.timestamp)}
              </span>
            )}
          </div>

          {/* Quick Action Buttons (Always visible on mobile/touch, fade on desktop) */}
          <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 shrink-0">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/80 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
              title="Copy Message"
              aria-label="Copy Message"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Regenerate Button (Only for last Assistant message) */}
            {!isUser && isLast && onRegenerate && !isGenerating && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/80 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
                title="Regenerate Response"
                aria-label="Regenerate Response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Markdown Rendered Message Content */}
        <div className="prose prose-invert max-w-none text-zinc-200 leading-relaxed font-light">
          {message.content ? (
            <MarkdownRenderer content={message.content} />
          ) : (
            <div className="flex items-center gap-2 text-zinc-500 text-sm italic font-light animate-pulse py-1 select-none">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-100" />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-200" />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-300" />
              <span>Analyzing models & streaming response...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
