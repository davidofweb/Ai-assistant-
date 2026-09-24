import React, { useState, useEffect, useRef } from 'react';
import { useChat } from './hooks/useChat';
import { useTheme } from './hooks/useTheme';
import { storage } from './services/storage';
import Layout from './components/Layout';
import ModelSelector from './components/ModelSelector';
import EmptyState from './components/EmptyState';
import MessageItem from './components/MessageItem';
import Composer from './components/Composer';
import SettingsModal from './components/SettingsModal';
import { Sparkles, ArrowDown } from 'lucide-react';

export default function App() {
  const {
    conversations,
    filteredConversations,
    activeConversation,
    activeId,
    setActiveId,
    models,
    selectedModelId,
    updateActiveModel,
    isGenerating,
    error,
    setError,
    searchQuery,
    setSearchQuery,
    createNewChat,
    deleteChat,
    renameChat,
    clearAllChats,
    sendMessage,
    stopGeneration,
    regenerateLastResponse,
  } = useChat();

  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loadedExamplePrompt, setLoadedExamplePrompt] = useState('');
  
  const [settings, setSettingsState] = useState(() => storage.getSettings());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<string>('100dvh');

  // Monitor settings sync
  const handleUpdateSettings = (newSettings: typeof settings) => {
    setSettingsState(newSettings);
    storage.saveSettings(newSettings);
    setTheme(newSettings.theme);
  };

  // Keep chat scrolled down during stream/generation
  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'auto') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages?.length]);

  // Handle auto-scroll on text stream change
  const lastMessageContent = activeConversation?.messages?.slice(-1)[0]?.content;
  useEffect(() => {
    // If we're close enough to the bottom, auto-scroll with incoming stream chunks
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      if (isNearBottom || isGenerating) {
        scrollToBottom();
      }
    }
  }, [lastMessageContent, isGenerating]);

  // Handle visual viewport resizing (mobile keyboard popping up) to lock container to visible area
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleViewportResize = () => {
      const vv = window.visualViewport;
      if (!vv) return;

      // Update the parent's container height so it matches the visual viewport height exactly
      setViewportHeight(`${vv.height}px`);

      // Small timeout to allow keyboard layout adjustment to finish and scroll smoothly
      setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
    };

    window.visualViewport.addEventListener('resize', handleViewportResize);
    window.visualViewport.addEventListener('scroll', handleViewportResize);
    
    // Run initial execution
    handleViewportResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
      window.visualViewport?.removeEventListener('scroll', handleViewportResize);
    };
  }, []);

  // Monitor scroll for "Scroll to bottom" button presence
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const threshold = 400;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > threshold);
    }
  };

  // Get active model name helper
  const getModelName = (id: string) => {
    return models.find((m) => m.id === id)?.name || id;
  };

  const handleSelectExample = (prompt: string) => {
    setLoadedExamplePrompt(prompt);
    // Clear value after pass so composer can consume and let user reuse if needed
    setTimeout(() => setLoadedExamplePrompt(''), 100);
  };

  return (
    <Layout
      conversations={filteredConversations}
      activeId={activeId}
      onSelectChat={setActiveId}
      onNewChat={() => createNewChat(selectedModelId)}
      onDeleteChat={deleteChat}
      onRenameChat={renameChat}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onOpenSettings={() => setIsSettingsOpen(true)}
      headerElement={
        <ModelSelector
          models={models}
          selectedId={selectedModelId}
          onChange={updateActiveModel}
          disabled={isGenerating}
        />
      }
    >
      {/* Messages Canvas / Scrollport */}
      <div 
        className="flex flex-col bg-zinc-950/20 w-full overflow-hidden h-[100dvh]" 
        style={{ height: viewportHeight }}
      >
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-6 md:py-8 space-y-6 scroll-smooth"
          style={{ minHeight: '-webkit-fill-available' }}
        >
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <EmptyState
              onSelectPrompt={handleSelectExample}
              models={models}
              selectedModelId={selectedModelId}
              onSelectModel={updateActiveModel}
            />
          ) : (
            <div className="space-y-6">
              {activeConversation.messages.map((message, index) => {
                const isLast = index === activeConversation.messages.length - 1;
                return (
                  <MessageItem
                    key={message.id}
                    message={message}
                    modelName={getModelName(message.modelId || activeConversation.selectedModelId)}
                    showTimestamps={settings.showTimestamps}
                    isLast={isLast}
                    isGenerating={isGenerating}
                    onRegenerate={regenerateLastResponse}
                  />
                );
              })}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Float Action: Jump to bottom */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-28 right-6 p-2 rounded-full border border-zinc-800 bg-zinc-900/95 text-zinc-300 hover:text-white hover:bg-zinc-850 shadow-xl z-25 transition-all duration-200 cursor-pointer flex items-center justify-center"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {/* Bottom Input Area Container */}
        <div className="composer-container p-3 sm:p-4 pb-4 sm:pb-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent border-t border-zinc-900/40 shrink-0 z-10 animate-fade-in">
          <Composer
            onSend={sendMessage}
            onStop={stopGeneration}
            isGenerating={isGenerating}
            enterToSend={settings.enterToSend}
            error={error}
            onClearError={() => setError(null)}
            initialValue={loadedExamplePrompt}
            placeholder={
              activeConversation
                ? `Message AgentRouter with ${getModelName(activeConversation.selectedModelId)}...`
                : "Ask AI AgentRouter anything..."
            }
          />
        </div>
      </div>

      {/* Persistent settings controller panel */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        models={models}
        selectedModelId={selectedModelId}
        onClearChats={clearAllChats}
      />
    </Layout>
  );
}
