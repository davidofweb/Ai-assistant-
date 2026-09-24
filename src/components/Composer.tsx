import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip, CornerDownLeft, ShieldAlert } from 'lucide-react';

interface ComposerProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  enterToSend: boolean;
  error?: string | null;
  onClearError?: () => void;
  placeholder?: string;
  initialValue?: string;
}

export default function Composer({
  onSend,
  onStop,
  isGenerating,
  enterToSend,
  error,
  onClearError,
  placeholder = "Message AI Agent Router...",
  initialValue = "",
}: ComposerProps) {
  const [input, setInput] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync external prompt loaded from landing examples
  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialValue]);

  // Handle auto-expanding text height (constrained responsively on mobile viewports)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const isMobile = window.innerWidth < 640;
      const maxHeight = isMobile ? 100 : 200;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    if (isGenerating) {
      onStop();
    } else {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (enterToSend) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleAttachmentMock = () => {
    console.info("Attachment UI mock: Local file integrations can be wired here in database modes.");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      {/* Error Banner Container */}
      {error && (
        <div className="flex items-start justify-between gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs sm:text-sm text-rose-300 animate-fade-in shadow-lg">
          <div className="flex gap-2.5 items-start">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-rose-200">System Request Failed</p>
              <p className="font-light leading-relaxed">{error}</p>
            </div>
          </div>
          {onClearError && (
            <button
              onClick={onClearError}
              className="text-xs text-rose-400 hover:text-rose-200 hover:underline cursor-pointer font-medium"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Main Composite Field */}
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col w-full bg-zinc-900 border border-zinc-800 focus-within:border-zinc-700 rounded-xl overflow-hidden transition-all duration-300 shadow-2xl focus-within:ring-1 focus-within:ring-zinc-700/50"
      >
        {/* Dynamic Textarea - Forced text-base to prevent iOS browser zooming */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          maxLength={20000}
          className="w-full bg-transparent px-4 pt-4 pb-3 text-zinc-100 placeholder-zinc-500 text-base font-light focus:outline-none resize-none overflow-y-auto leading-relaxed max-h-[100px] sm:max-h-[200px]"
          aria-label="Chat Input"
        />

        {/* Toolbar Footer inside Composer */}
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/40 border-t border-zinc-800/40 select-none">
          {/* Mock attachment link */}
          <button
            type="button"
            onClick={handleAttachmentMock}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Prompt indicators or length count */}
          <div className="flex items-center gap-4 text-[10px] sm:text-xs text-zinc-500 font-mono tracking-wide">
            {input.length > 500 && (
              <span className="tabular-nums">
                {input.length} / 20,000
              </span>
            )}
            <span className="hidden sm:inline text-zinc-600">
              Shift + Enter for newline
            </span>
          </div>

          {/* Action Button: Send / Stop */}
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <button
                type="button"
                onClick={onStop}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-rose-200 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/50 rounded-lg transition-all cursor-pointer shadow-md"
              >
                <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-rose-200" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shadow-md ${
                  input.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/20 cursor-pointer'
                    : 'bg-zinc-800 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Send</span>
                <CornerDownLeft className="hidden sm:inline w-3 h-3 text-indigo-300" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
