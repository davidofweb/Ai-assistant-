export interface ModelMetadata {
  id: string;
  name: string;
  description: string;
  tier: 'Fast' | 'Balanced' | 'Advanced';
}

export const ALLOWED_MODELS: Record<string, ModelMetadata> = {
  'claude-opus-4-8': {
    id: 'claude-opus-4-8',
    name: 'Claude Opus 4.8',
    description: 'Advanced reasoning, writing, analysis and complex tasks.',
    tier: 'Advanced',
  },
  'claude-opus-5': {
    id: 'claude-opus-5',
    name: 'Claude Opus 5',
    description: 'Advanced reasoning, long-form work and difficult problems.',
    tier: 'Advanced',
  },
  'deepseek-v4-flash': {
    id: 'deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    description: 'Fast responses and efficient everyday AI tasks.',
    tier: 'Fast',
  },
  'gpt-6-astra': {
    id: 'gpt-6-astra',
    name: 'GPT-6 Astra',
    description: 'General-purpose reasoning, coding, analysis and creative tasks.',
    tier: 'Balanced',
  },
};

export const modelKeys = Object.keys(ALLOWED_MODELS);
