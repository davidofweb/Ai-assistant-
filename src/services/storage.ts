import { Conversation, Settings } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'agentrouter_conversations_v1',
  ACTIVE_CHAT_ID: 'agentrouter_active_chat_id_v1',
  SETTINGS: 'agentrouter_settings_v1',
};

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  enterToSend: true,
  showTimestamps: true,
};

export const storage = {
  // --- Conversations ---
  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse conversations from storage:', e);
      return [];
    }
  },

  saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations to storage:', e);
    }
  },

  getConversation(id: string): Conversation | undefined {
    const list = this.getConversations();
    return list.find((c) => c.id === id);
  },

  saveConversation(conv: Conversation): void {
    const list = this.getConversations();
    const idx = list.findIndex((c) => c.id === conv.id);
    if (idx > -1) {
      list[idx] = conv;
    } else {
      list.unshift(conv);
    }
    this.saveConversations(list);
  },

  deleteConversation(id: string): void {
    const list = this.getConversations();
    const filtered = list.filter((c) => c.id !== id);
    this.saveConversations(filtered);
  },

  clearAllConversations(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT_ID);
    } catch (e) {
      console.error('Failed to clear conversations:', e);
    }
  },

  // --- Active Chat ID ---
  getActiveChatId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT_ID);
  },

  setActiveChatId(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT_ID);
    }
  },

  // --- Settings ---
  getSettings(): Settings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },
};
