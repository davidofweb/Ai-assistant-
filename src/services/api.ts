import { ModelConfig } from '../types';

export const api = {
  // --- Fetch Available Models from Backend ---
  async getModels(): Promise<ModelConfig[]> {
    try {
      const response = await fetch('/api/models');
      if (!response.ok) {
        throw new Error('Failed to load models list from server.');
      }
      const data = await response.json();
      return data.models || [];
    } catch (err) {
      console.error('Error fetching models:', err);
      throw err;
    }
  },

  // --- Send Chat Prompt to Server with Streaming Support ---
  async sendChatStream(
    messages: { role: string; content: string }[],
    modelId: string,
    onChunk: (chunk: string) => void,
    onFinish: () => void,
    onError: (error: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model: modelId, // Exact schema requirement: { "model": "claude-opus-4-8", "messages": [...] }
        }),
        signal,
      });

      if (!response.ok) {
        // If the server returns standard JSON error
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errData = await response.json();
          throw new Error(errData.error?.message || 'Server error occurred.');
        } else {
          const errText = await response.text();
          throw new Error(errText || `Server returned error status [${response.status}].`);
        }
      }

      if (!response.body) {
        throw new Error('No content stream returned from server.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const textChunk = decoder.decode(value);
        
        // Handle potential server-side exception embedded in stream
        if (textChunk.includes('[Stream interrupted due to a server-side error]')) {
          throw new Error('Streaming connection was interrupted on the server.');
        }
        
        onChunk(textChunk);
      }

      onFinish();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
        onFinish(); // finalize clean state
        return;
      }
      console.error('Streaming API error:', err);
      onError(err.message || 'An error occurred while communicating with the server.');
    }
  },
};
