import React, { useState } from 'react';
import { Conversation, ModelConfig } from '../types';
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Settings as SettingsIcon,
  Menu,
  X,
  User,
  Terminal,
  Edit2,
  Check,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  conversations: Conversation[];
  activeId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat?: (id: string, newTitle: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSettings: () => void;
  headerElement?: React.ReactNode;
}

export default function Layout({
  children,
  conversations,
  activeId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  searchQuery,
  onSearchChange,
  onOpenSettings,
  headerElement,
}: LayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Renaming State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  
  // Header renaming
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerRenameValue, setHeaderRenameValue] = useState('');

  const activeChat = conversations.find((c) => c.id === activeId);

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleStartRename = (id: string, currentTitle: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(id);
    setRenameValue(currentTitle);
  };

  const handleSaveRename = (id: string) => {
    if (renameValue.trim() && onRenameChat) {
      onRenameChat(id, renameValue.trim());
    }
    setEditingId(null);
  };

  const handleStartHeaderRename = () => {
    if (activeChat) {
      setIsEditingHeader(true);
      setHeaderRenameValue(activeChat.title);
    }
  };

  const handleSaveHeaderRename = () => {
    if (activeId && headerRenameValue.trim() && onRenameChat) {
      onRenameChat(activeId, headerRenameValue.trim());
    }
    setIsEditingHeader(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center border border-indigo-500/20 shadow-md shadow-indigo-600/10">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white leading-tight">AgentRouter Hub</span>
            <span className="text-3xs text-zinc-500 tracking-wider font-mono">v1.2.0-STABLE</span>
          </div>
        </div>
        
        {/* Collapse button for desktop */}
        <button
          onClick={() => setIsSidebarCollapsed(true)}
          className="hidden md:flex p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer"
          title="Collapse Sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Action CTA: New Chat */}
      <button
        onClick={() => {
          onNewChat();
          setIsMobileOpen(false);
        }}
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-100 font-medium text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
      >
        <Plus className="w-4 h-4 text-indigo-400" />
        <span>New Chat</span>
      </button>

      {/* Interactive Search Field */}
      <div className="relative mt-4 mb-3">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search conversation log..."
          className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all focus:ring-1 focus:ring-zinc-700/50"
        />
      </div>

      {/* Recents List Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-1 py-1 -mx-2 px-2">
        <div className="px-2 pb-1.5 flex items-center justify-between">
          <span className="text-3xs font-semibold text-zinc-600 tracking-wider">RECENT DISCOURSES</span>
          <span className="text-3xs text-zinc-700 font-mono">COUNT: {conversations.length}</span>
        </div>

        {conversations.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-600 font-light italic">
            No histories found.
          </div>
        ) : (
          conversations.map((chat) => {
            const isActive = chat.id === activeId;
            const isEditing = editingId === chat.id;

            return (
              <div
                key={chat.id}
                className={`group relative flex items-center justify-between rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 font-medium'
                    : 'hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 w-full">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(chat.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 w-full"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveRename(chat.id)}
                      className="p-1 bg-indigo-600 hover:bg-indigo-550 text-white rounded cursor-pointer shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 bg-zinc-800 hover:bg-zinc-755 text-zinc-400 rounded cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onSelectChat(chat.id);
                        setIsMobileOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 w-full text-left text-xs sm:text-sm truncate cursor-pointer h-9 pr-14"
                    >
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                      <span className="truncate flex-1">{chat.title}</span>
                    </button>

                    {/* Actions Panel */}
                    <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => handleStartRename(chat.id, chat.title, e)}
                        className="text-zinc-500 hover:text-indigo-400 p-1 rounded hover:bg-zinc-800 cursor-pointer"
                        title="Rename Discourse"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        className="text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-zinc-800 cursor-pointer"
                        title="Delete Conversation"
                        aria-label="Delete Conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Profile & Settings Footer Zone */}
      <div className="border-t border-zinc-900 pt-3 mt-auto space-y-1 select-none">
        {/* Settings button */}
        <button
          onClick={() => {
            onOpenSettings();
            setIsMobileOpen(false);
          }}
          className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40 w-full rounded-lg transition-colors text-xs font-medium cursor-pointer"
        >
          <SettingsIcon className="w-4 h-4 text-zinc-500" />
          <span>Application Settings</span>
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-900/30 border border-zinc-900">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-300">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-zinc-300 truncate">Developer Console</span>
            <span className="text-[10px] text-zinc-500 truncate">freedomdavid47</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-zinc-950 font-sans">
      {/* 1. DESKTOP SIDEBAR PANEL */}
      <aside className={`hidden md:block border-r border-zinc-900 shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-0 overflow-hidden border-r-0' : 'w-64 h-full'}`}>
        <SidebarContent />
      </aside>

      {/* Sidebar Trigger when collapsed */}
      {isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="hidden md:flex fixed bottom-5 left-5 p-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/20 text-white rounded-xl shadow-xl z-30 cursor-pointer transition-transform hover:scale-105"
          title="Expand Sidebar"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
      )}

      {/* 2. MOBILE DRAWER OVERLAY */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* 3. MOBILE SLIDE-OUT PANEL */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-zinc-950 z-50 border-r border-zinc-900 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* 4. MAIN VIEWPORT CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header Contract */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md shrink-0 select-none relative z-20">
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button
              onClick={toggleMobileSidebar}
              className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-100 md:hidden transition-colors cursor-pointer"
              aria-label="Toggle Navigation Drawer"
            >
              {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Breadcrumb Info / Title */}
            <div className="flex flex-col min-w-0">
              <span className="text-3xs text-zinc-500 tracking-wider font-semibold uppercase leading-none mb-0.5">ACTIVE CONTEXT</span>
              {isEditingHeader ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={headerRenameValue}
                    onChange={(e) => setHeaderRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveHeaderRename();
                      if (e.key === 'Escape') setIsEditingHeader(false);
                    }}
                    className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500 w-36 sm:w-48"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveHeaderRename}
                    className="p-0.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsEditingHeader(false)}
                    className="p-0.5 bg-zinc-800 text-zinc-400 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 max-w-[140px] sm:max-w-xs md:max-w-md">
                  <span
                    onClick={handleStartHeaderRename}
                    className="text-xs sm:text-sm font-semibold text-zinc-200 truncate cursor-pointer hover:text-white hover:underline decoration-zinc-500"
                    title="Click to rename"
                  >
                    {activeChat ? activeChat.title : 'New Discourse'}
                  </span>
                  {activeChat && (
                    <button
                      onClick={handleStartHeaderRename}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 cursor-pointer transition-colors"
                      title="Rename Conversation"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Model Selector / Custom Header items passed */}
          <div className="flex items-center gap-2">
            {headerElement}
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
