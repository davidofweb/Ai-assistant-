export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelId?: string; // Saves the model used for each response to display properly
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  selectedModelId: string;
  createdAt: number;
  updatedAt: number;
}

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  tier: 'Fast' | 'Balanced' | 'Advanced';
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  enterToSend: boolean;
  showTimestamps: boolean;
}

export interface ChatRequest {
  messages: { role: string; content: string }[];
  modelId: string;
}

export interface APIErrorResponse {
  error: {
    message: string;
    code?: string;
  };
}
