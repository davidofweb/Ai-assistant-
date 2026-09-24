import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Parsing flow: we split the document into raw logical blocks (paragraphs, lists, headers, code-blocks)
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLanguage = '';
  let keyCounter = 0;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    // Trigger local state updates if needed, handled inline on components below
  };

  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    // Basic inline parser for: **bold**, *italic*, `code`
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index} className="italic text-zinc-200">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 font-mono text-xs text-indigo-300 bg-zinc-900 rounded border border-zinc-800">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const CodeBlockComponent = ({ code, language }: { code: string; language: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="my-5 rounded-xl border border-zinc-800/80 bg-zinc-950 overflow-hidden shadow-xl font-mono text-sm leading-relaxed text-zinc-300">
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/40 border-b border-zinc-800/80 text-xs font-mono text-zinc-400 select-none">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-zinc-500" />
            <span>{language || 'code'}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 overflow-x-auto">
          <pre className="text-xs sm:text-sm whitespace-pre">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        const codeText = codeLines.join('\n');
        elements.push(
          <CodeBlockComponent key={`code-${keyCounter++}`} code={codeText} language={codeLanguage} />
        );
        codeLines = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        // Open code block
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).toLowerCase() || 'code';
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${keyCounter++}`} className="text-base font-semibold text-zinc-100 mt-5 mb-2">
          {parseInlineMarkdown(line.slice(4))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={`h2-${keyCounter++}`} className="text-lg font-semibold text-zinc-100 mt-6 mb-3">
          {parseInlineMarkdown(line.slice(3))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h2 key={`h1-${keyCounter++}`} className="text-xl font-semibold text-zinc-500 mt-8 mb-4">
          {parseInlineMarkdown(line.slice(2))}
        </h2>
      );
      continue;
    }

    // Bullet lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletText = line.trim().substring(2);
      elements.push(
        <ul key={`ul-${keyCounter++}`} className="list-disc pl-5 my-1.5 text-zinc-300 text-sm leading-relaxed space-y-1">
          <li>{parseInlineMarkdown(bulletText)}</li>
        </ul>
      );
      continue;
    }

    // Numbered lists
    const numberListMatch = line.trim().match(/^(\d+)\.\s(.*)/);
    if (numberListMatch) {
      const listContent = numberListMatch[2];
      elements.push(
        <ol key={`ol-${keyCounter++}`} className="list-decimal pl-5 my-1.5 text-zinc-300 text-sm leading-relaxed space-y-1">
          <li>{parseInlineMarkdown(listContent)}</li>
        </ol>
      );
      continue;
    }

    // Empty lines or paragraphs
    if (line.trim() === '') {
      elements.push(<div key={`space-${keyCounter++}`} className="h-2" />);
    } else {
      elements.push(
        <p key={`p-${keyCounter++}`} className="text-zinc-300 text-sm sm:text-base font-light leading-relaxed mb-3">
          {parseInlineMarkdown(line)}
        </p>
      );
    }
  }

  // Handle unclosed code block at end of input gracefully
  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <CodeBlockComponent key={`code-${keyCounter++}`} code={codeLines.join('\n')} language={codeLanguage} />
    );
  }

  return <div className="space-y-0.5">{elements}</div>;
}
