import React from 'react';
import { Terminal, Code, HelpCircle, LineChart, Cpu, Sparkles, Zap, Shield, Flame } from 'lucide-react';
import { ModelConfig } from '../types';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
  models: ModelConfig[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
}

export default function EmptyState({
  onSelectPrompt,
  models,
  selectedModelId,
  onSelectModel,
}: EmptyStateProps) {
  const examplePrompts = [
    {
      text: "Build me a React application.",
      icon: Code,
      color: "text-indigo-400 bg-indigo-950/40 border-indigo-800/30",
      desc: "Coding & software design templates"
    },
    {
      text: "Explain this concept like I'm a beginner.",
      icon: HelpCircle,
      color: "text-amber-400 bg-amber-950/40 border-amber-800/30",
      desc: "Clear explanations & learning"
    },
    {
      text: "Analyze this business idea.",
      icon: LineChart,
      color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/30",
      desc: "Strategy, pricing & market logic"
    },
    {
      text: "Help me debug my code.",
      icon: Cpu,
      color: "text-cyan-400 bg-cyan-950/40 border-cyan-800/30",
      desc: "Find memory leaks & syntax bugs"
    },
  ];

  // Helper icons for the models
  const getModelBadgeInfo = (id: string) => {
    switch (id) {
      case 'claude-opus-4-8':
        return { icon: Sparkles, color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' };
      case 'claude-opus-5':
        return { icon: Flame, color: 'text-rose-400 border-rose-500/20 bg-rose-500/5' };
      case 'deepseek-v4-flash':
        return { icon: Zap, color: 'text-sky-400 border-sky-500/20 bg-sky-500/5' };
      case 'gpt-6-astra':
        return { icon: Shield, color: 'text-purple-400 border-purple-500/20 bg-purple-500/5' };
      default:
        return { icon: Cpu, color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-4xl mx-auto px-4 text-center py-8 select-none">
      {/* Brand Identity */}
      <div className="mb-6 p-4.5 bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-xl flex items-center justify-center animate-fade-in relative">
        <Terminal className="w-10 h-10 text-indigo-500" />
        <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 max-w-xl">
        AgentRouter Intelligence Hub
      </h1>
      <p className="text-zinc-400 text-xs sm:text-sm font-light mb-8 max-w-lg leading-relaxed">
        An ultra-premium, zero-leak sandboxed console connected directly to the AgentRouter platform gateway.
      </p>

      {/* Model Selection Panel */}
      <div className="w-full space-y-3 mb-8">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
          <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase font-semibold">
            CHOOSE YOUR ENGINE (Click card to select)
          </span>
          <span className="text-[10px] font-mono text-indigo-400">
            Active: {selectedModelId}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {models.map((m) => {
            const isSelected = m.id === selectedModelId;
            const badge = getModelBadgeInfo(m.id);
            const Icon = badge.icon;

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectModel(m.id)}
                className={`group flex flex-col justify-between text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 border-indigo-500/80 shadow-[0_0_12px_rgba(79,70,229,0.15)] ring-1 ring-indigo-500/40 text-white'
                    : 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-900 hover:border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold leading-tight truncate pr-1">
                      {m.name}
                    </span>
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${badge.icon ? badge.icon : 'text-zinc-500'}`} />
                  </div>
                  <p className="text-3xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-zinc-850">
                  <span className="text-3xs font-mono font-medium text-zinc-500 tracking-wider">
                    {m.id}
                  </span>
                  {isSelected ? (
                    <span className="text-4xs font-semibold px-1.5 py-0.5 bg-indigo-500/15 text-indigo-400 rounded uppercase tracking-wider border border-indigo-500/25">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-4xs text-zinc-600 uppercase group-hover:text-zinc-400 transition-colors">
                      SELECT
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested Starters */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
          <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase font-semibold">
            SUGGESTED DISCOURSE INITIATORS
          </span>
          <span className="text-[10px] font-mono text-zinc-600">
            Click prompt to load
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {examplePrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPrompt(item.text)}
                className="group flex items-start gap-3.5 p-3.5 text-left bg-zinc-900/30 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className={`p-2 rounded-lg shrink-0 border border-zinc-800/40 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors leading-snug">
                    {item.text}
                  </p>
                  <p className="text-3xs text-zinc-500 font-light">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
