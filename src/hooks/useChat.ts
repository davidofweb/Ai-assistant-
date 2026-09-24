import { useState, useEffect, useRef } from 'react';
import { Conversation, Message, ModelConfig } from '../types';
import { storage } from '../services/storage';
import { api } from '../services/api';

const ALLOWED_MODEL_IDS = ['claude-opus-4-8', 'claude-opus-5', 'deepseek-v4-flash', 'gpt-6-astra'];

const FALLBACK_MODELS: ModelConfig[] = [
  {
    id: 'claude-opus-4-8',
    name: 'Claude Opus 4.8',
    description: 'Advanced reasoning, writing, analysis and complex tasks.',
    tier: 'Advanced',
  },
  {
    id: 'claude-opus-5',
    name: 'Claude Opus 5',
    description: 'Advanced reasoning, long-form work and difficult problems.',
    tier: 'Advanced',
  },
  {
    id: 'deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    description: 'Fast responses and efficient everyday AI tasks.',
    tier: 'Fast',
  },
  {
    id: 'gpt-6-astra',
    name: 'GPT-6 Astra',
    description: 'General-purpose reasoning, coding, analysis and creative tasks.',
    tier: 'Balanced',
  },
];

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Initialize with fallback models to ensure instant UI responsiveness
  const [models, setModels] = useState<ModelConfig[]>(FALLBACK_MODELS);
  const [selectedModelId, setSelectedModelId] = useState<string>('deepseek-v4-flash');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load initial data
  useEffect(() => {
    const loadedConvs = storage.getConversations();
    
    // Migrate any legacy models from previous application versions
    const migratedConvs = loadedConvs.map((c) => {
      if (!ALLOWED_MODEL_IDS.includes(c.selectedModelId)) {
        return { ...c, selectedModelId: 'deepseek-v4-flash' };
      }
      return c;
    });

    if (JSON.stringify(loadedConvs) !== JSON.stringify(migratedConvs)) {
      storage.saveConversations(migratedConvs);
    }
    
    setConversations(migratedConvs);

    const savedActiveId = storage.getActiveChatId();
    if (savedActiveId && migratedConvs.some((c) => c.id === savedActiveId)) {
      setActiveId(savedActiveId);
      const activeConv = migratedConvs.find((c) => c.id === savedActiveId);
      if (activeConv) {
        setSelectedModelId(activeConv.selectedModelId);
      }
    } else if (migratedConvs.length > 0) {
      setActiveId(migratedConvs[0].id);
      setSelectedModelId(migratedConvs[0].selectedModelId);
      storage.setActiveChatId(migratedConvs[0].id);
    }

    // Load available models from server config
    const loadModels = async () => {
      try {
        setIsLoadingModels(true);
        const fetched = await api.getModels();
        if (fetched && fetched.length > 0) {
          setModels(fetched);
          // If the selected model is not in the loaded models list, select the first one
          if (!fetched.some((m) => m.id === selectedModelId)) {
            setSelectedModelId(fetched[0].id);
          }
        }
      } catch (err: any) {
        console.warn('Could not fetch models config from server, using local fallbacks:', err);
      } finally {
        setIsLoadingModels(false);
      }
    };

    loadModels();
  }, []);

  // Sync active id in storage
  useEffect(() => {
    storage.setActiveChatId(activeId);
    if (activeId) {
      const activeConv = conversations.find((c) => c.id === activeId);
      if (activeConv) {
        setSelectedModelId(activeConv.selectedModelId);
      }
    }
  }, [activeId, conversations]);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  // Search filtered conversations
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Create new conversation
  const createNewChat = (initialModelId?: string) => {
    const newId = crypto.randomUUID();
    const newConv: Conversation = {
      id: newId,
      title: 'New Discourse',
      messages: [],
      selectedModelId: initialModelId || selectedModelId || 'deepseek-v4-flash',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [newConv, ...conversations];
    setConversations(updated);
    storage.saveConversations(updated);
    setActiveId(newId);
    setError(null);
    return newConv;
  };

  // Delete conversation
  const deleteChat = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    storage.saveConversations(updated);

    if (activeId === id) {
      if (updated.length > 0) {
        setActiveId(updated[0].id);
      } else {
        setActiveId(null);
      }
    }
  };

  // Rename conversation
  const renameChat = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    const updated = conversations.map((c) => {
      if (c.id === id) {
        return { ...c, title: newTitle.trim(), updatedAt: Date.now() };
      }
      return c;
    });
    setConversations(updated);
    storage.saveConversations(updated);
  };

  // Clear all conversations
  const clearAllChats = () => {
    storage.clearAllConversations();
    setConversations([]);
    setActiveId(null);
    setError(null);
  };

  // Update active model ID
  const updateActiveModel = (modelId: string) => {
    setSelectedModelId(modelId);
    if (activeConversation) {
      const updated = conversations.map((c) => {
        if (c.id === activeConversation.id) {
          return { ...c, selectedModelId: modelId, updatedAt: Date.now() };
        }
        return c;
      });
      setConversations(updated);
      storage.saveConversations(updated);
    }
  };

  // Stop current AI generation
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  // Send message to current chat
  const sendMessage = async (content: string) => {
    if (!content.trim() || isGenerating) return;

    setError(null);
    let currentConv = activeConversation;

    // Auto-create chat if none exists or if we are on empty initial list
    if (!currentConv) {
      currentConv = createNewChat(selectedModelId);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    // Update state and list
    const updatedMessages = [...currentConv.messages, userMessage];
    
    // Auto title generation from first user query
    let newTitle = currentConv.title;
    if (currentConv.messages.length === 0 || currentConv.title === 'New Discourse') {
      const promptSnippet = content.trim();
      newTitle = promptSnippet.length > 32 
        ? promptSnippet.substring(0, 32) + '...' 
        : promptSnippet;
    }

    const updatedConv: Conversation = {
      ...currentConv,
      title: newTitle,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    const updatedList = conversations.map((c) => (c.id === updatedConv.id ? updatedConv : c));
    
    // Re-order active chat to top
    const sortedList = [
      updatedConv,
      ...updatedList.filter((c) => c.id !== updatedConv.id),
    ];

    setConversations(sortedList);
    storage.saveConversations(sortedList);

    // Prepare assistant response placeholder
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      modelId: updatedConv.selectedModelId, // Save the model used for each message
    };

    // Ready stream parameters
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    // Setup streaming output accumulators
    let fullContent = '';

    await api.sendChatStream(
      updatedMessages,
      updatedConv.selectedModelId,
      (chunk) => {
        fullContent += chunk;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === updatedConv.id) {
              const msgIndex = c.messages.findIndex((m) => m.id === assistantMessageId);
              let newMsgs = [...c.messages];
              if (msgIndex > -1) {
                newMsgs[msgIndex] = { ...newMsgs[msgIndex], content: fullContent };
              } else {
                newMsgs.push({ ...assistantMessage, content: fullContent });
              }
              return { ...c, messages: newMsgs, updatedAt: Date.now() };
            }
            return c;
          })
        );
      },
      () => {
        // Stream completed successfully, sync final to storage
        setIsGenerating(false);
        setConversations((prev) => {
          storage.saveConversations(prev);
          return prev;
        });
      },
      (errMessage) => {
        setIsGenerating(false);
        setError(errMessage);
        
        // Remove assistant placeholder if it remained completely empty
        setConversations((prev) => {
          const final = prev.map((c) => {
            if (c.id === updatedConv.id) {
              const target = c.messages.find((m) => m.id === assistantMessageId);
              if (target && !target.content) {
                return { ...c, messages: c.messages.filter((m) => m.id !== assistantMessageId) };
              }
            }
            return c;
          });
          storage.saveConversations(final);
          return final;
        });
      },
      abortControllerRef.current.signal
    );
  };

  // Regenerate response
  const regenerateLastResponse = async () => {
    if (!activeConversation || isGenerating || activeConversation.messages.length === 0) return;

    // Find last user message, and delete all assistant messages after it
    const lastUserMsgIdx = [...activeConversation.messages]
      .reverse()
      .findIndex((m) => m.role === 'user');

    if (lastUserMsgIdx === -1) return;

    const actualIdx = activeConversation.messages.length - 1 - lastUserMsgIdx;
    const historyToKeep = activeConversation.messages.slice(0, actualIdx + 1);

    const updatedConv: Conversation = {
      ...activeConversation,
      messages: historyToKeep,
      updatedAt: Date.now(),
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === updatedConv.id ? updatedConv : c))
    );
    setError(null);

    // Now send the rest of the flow
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      modelId: updatedConv.selectedModelId, // Save the model used for each message
    };

    let fullContent = '';

    await api.sendChatStream(
      historyToKeep,
      updatedConv.selectedModelId,
      (chunk) => {
        fullContent += chunk;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === updatedConv.id) {
              const msgIndex = c.messages.findIndex((m) => m.id === assistantMessageId);
              let newMsgs = [...c.messages];
              if (msgIndex > -1) {
                newMsgs[msgIndex] = { ...newMsgs[msgIndex], content: fullContent };
              } else {
                newMsgs.push({ ...assistantMessage, content: fullContent });
              }
              return { ...c, messages: newMsgs, updatedAt: Date.now() };
            }
            return c;
          })
        );
      },
      () => {
        setIsGenerating(false);
        setConversations((prev) => {
          storage.saveConversations(prev);
          return prev;
        });
      },
      (errMessage) => {
        setIsGenerating(false);
        setError(errMessage);
        setConversations((prev) => {
          const final = prev.map((c) => {
            if (c.id === updatedConv.id) {
              const target = c.messages.find((m) => m.id === assistantMessageId);
              if (target && !target.content) {
                return { ...c, messages: c.messages.filter((m) => m.id !== assistantMessageId) };
              }
            }
            return c;
          });
          storage.saveConversations(final);
          return final;
        });
      },
      abortControllerRef.current.signal
    );
  };

  return {
    conversations,
    filteredConversations,
    activeConversation,
    activeId,
    setActiveId,
    models,
    selectedModelId,
    updateActiveModel,
    isGenerating,
    isLoadingModels,
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
  };
}
