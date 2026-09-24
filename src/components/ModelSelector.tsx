import React, { useState, useRef, useEffect } from 'react';
import { ModelConfig } from '../types';
import { ChevronDown, Sparkles, Zap, ShieldAlert, Cpu } from 'lucide-react';

interface ModelSelectorProps {
  models: ModelConfig[];
  selectedId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({ models, selectedId, onChange, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeModel = models.find((m) => m.id === selectedId);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Fast':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Balanced':
        return <Cpu className="w-4 h-4 text-blue-500" />;
      case 'Advanced':
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
      default:
        return <Cpu className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getTierBadgeStyles = (tier: string) => {
    switch (tier) {
      case 'Fast':
        return 'text-amber-400/90';
      case 'Balanced':
        return 'text-blue-400/90';
      case 'Advanced':
        return 'text-indigo-400/90';
      default:
        return 'text-zinc-400';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-200 transition-all duration-200 cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {activeModel ? getTierIcon(activeModel.tier) : <Cpu className="w-4 h-4 text-zinc-500" />}
          <span className="text-sm font-medium whitespace-nowrap">
            {activeModel ? activeModel.name : 'Loading Models...'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full mt-2 right-0 w-[280px] sm:w-[320px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 animate-fade-in"
          role="listbox"
        >
          <div className="px-3 py-2 border-b border-zinc-800/60 mb-1">
            <span className="text-xs font-semibold text-zinc-500 tracking-wider">SELECT ENGINE</span>
          </div>

          <div className="space-y-1">
            {models.map((model) => {
              const isSelected = model.id === selectedId;
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onChange(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 p-2.5 text-left rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-800/80 border border-zinc-700/50'
                      : 'hover:bg-zinc-800/40 border border-transparent'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="mt-0.5 shrink-0">{getTierIcon(model.tier)}</div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-100">{model.name}</span>
                      <span className={`text-2xs font-mono tracking-wider ${getTierBadgeStyles(model.tier)}`}>
                        {model.tier}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-light leading-normal">{model.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {models.length === 0 && (
            <div className="flex items-center gap-2 p-3 text-zinc-500">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="text-xs font-light">No engine configuration returned by the backend.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
