import React, { useState } from 'react';
import { Settings, ModelConfig } from '../types';
import { X, Moon, Sun, Monitor, AlertTriangle, Cpu, Info, Check, ShieldAlert } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (s: Settings) => void;
  models: ModelConfig[];
  selectedModelId: string;
  onClearChats: () => void;
}

type TabType = 'appearance' | 'chat' | 'model' | 'about';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  models,
  selectedModelId,
  onClearChats,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const currentModel = models.find((m) => m.id === selectedModelId);

  const toggleEnterToSend = () => {
    onUpdateSettings({ ...settings, enterToSend: !settings.enterToSend });
  };

  const toggleShowTimestamps = () => {
    onUpdateSettings({ ...settings, showTimestamps: !settings.showTimestamps });
  };

  const handleSetTheme = (theme: Settings['theme']) => {
    onUpdateSettings({ ...settings, theme });
  };

  const handleClearAll = () => {
    onClearChats();
    setShowClearConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[500px]">
        {/* Left Sidebar Tab Navigation */}
        <div className="w-full md:w-48 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 p-4 space-y-1 shrink-0 flex md:flex-col overflow-x-auto md:overflow-x-visible">
          <div className="hidden md:block mb-4 px-2">
            <span className="text-xs font-semibold text-zinc-500 tracking-wider">SETTINGS</span>
          </div>

          <div className="flex md:flex-col gap-1 w-full whitespace-nowrap">
            {[
              { id: 'appearance', label: 'Appearance', icon: Sun },
              { id: 'chat', label: 'Chat Control', icon: Cpu },
              { id: 'model', label: 'Models Info', icon: Info },
              { id: 'about', label: 'About App', icon: Check },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer text-left w-full ${
                    isActive
                      ? 'bg-zinc-900 border border-zinc-800 text-white shadow-inner'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Frame */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/60">
              <h2 className="text-lg font-semibold text-white capitalize">{activeTab} Settings</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB: APPEARANCE */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-zinc-300">Theme Preference</h3>
                  <p className="text-xs text-zinc-500">Choose how the application workspace looks on your screen.</p>
                  
                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Monitor },
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSelected = settings.theme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleSetTheme(t.id as Settings['theme'])}
                          className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-800 border-indigo-500 text-indigo-400 font-semibold'
                              : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CHAT CONTROL */}
            {activeTab === 'chat' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800/60">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-zinc-200">Enter to Send Messages</p>
                    <p className="text-xs text-zinc-500">Press Enter to send. Use Shift+Enter for newlines.</p>
                  </div>
                  <button
                    onClick={toggleEnterToSend}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.enterToSend ? 'bg-indigo-600' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.enterToSend ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800/60">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-zinc-200">Show Message Timestamps</p>
                    <p className="text-xs text-zinc-500">Display exact times of user requests and agent answers.</p>
                  </div>
                  <button
                    onClick={toggleShowTimestamps}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.showTimestamps ? 'bg-indigo-600' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.showTimestamps ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 bg-rose-950/20 border border-rose-950/40 rounded-xl space-y-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-rose-300">Danger Zone</p>
                    <p className="text-xs text-rose-400">Permanently clear all historical logs and conversations from local storage.</p>
                  </div>
                  
                  {showClearConfirm ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleClearAll}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                      >
                        Yes, Clear All
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="px-3.5 py-2 border border-rose-800 hover:bg-rose-950 text-rose-300 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Delete Conversations</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB: MODEL INFO */}
            {activeTab === 'model' && (
              <div className="space-y-4">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-semibold text-zinc-100">Active Engine Configuration</span>
                  </div>
                  
                  {currentModel ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800 text-xs">
                        <span className="text-zinc-500 font-mono">MODEL ID</span>
                        <span className="text-indigo-400 font-mono font-medium">{currentModel.id}</span>
                      </div>
                      <div className="flex justify-between items-center bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800 text-xs">
                        <span className="text-zinc-500 font-mono">NAME</span>
                        <span className="text-zinc-200 font-medium">{currentModel.name}</span>
                      </div>
                      <div className="flex justify-between items-center bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800 text-xs">
                        <span className="text-zinc-500 font-mono">TIER</span>
                        <span className="text-amber-400 font-medium font-mono">{currentModel.tier}</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-normal pt-1">{currentModel.description}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">No active model loaded. Choose a model using the header dropdown selectors.</p>
                  )}
                </div>
                
                <p className="text-2xs text-zinc-500 leading-normal">
                  Note: Actual model identifiers are securely resolved on the server-side against an allowed whitelist to prevent client injection.
                </p>
              </div>
            )}

            {/* TAB: ABOUT APP */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-mono">APP VERSION</span>
                    <span className="text-zinc-300 font-mono">v1.2.0-stable</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-mono">SERVER FRAMEWORK</span>
                    <span className="text-zinc-300 font-mono">Express & Vite (Full-Stack)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-mono">API DEPLOYMENT</span>
                    <span className="text-zinc-300 font-mono">Vercel & Docker Ready</span>
                  </div>
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-zinc-500 font-mono">AGENTROUTER STATUS</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-mono font-semibold">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <span>ONLINE</span>
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/10 border border-indigo-950/30 rounded-xl flex gap-3">
                  <X className="w-5 h-5 text-indigo-400 shrink-0 rotate-45" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-zinc-200">Zero Leak Key Architecture</p>
                    <p className="text-2xs text-zinc-400 leading-relaxed">
                      Your `AGENTROUTER_API_KEY` is fully contained in node.js runtime. No client-side leaks are possible since all requests funnel through server endpoints.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-800/60 flex justify-between items-center text-3xs text-zinc-600 font-mono uppercase tracking-widest select-none">
            <span>Enterprise Design</span>
            <span>AgentRouter Inc © 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
