import { Response } from 'express';

export class AgentRouterService {
  private static getApiKey(): string {
    const key = process.env.AGENTROUTER_API_KEY;
    if (!key) {
      throw new Error('AGENTROUTER_API_KEY is not defined in the server environment configuration.');
    }
    return key;
  }

  private static getBaseUrl(): string {
    return process.env.AGENTROUTER_BASE_URL || 'https://agentrouter.org/v1';
  }

  /**
   * Forwards chat completions to the active AgentRouter API key in the environment,
   * streaming chunks directly into the Express Response stream.
   * Bubbles up real authentication, rate-limiting, and firewall errors to the client.
   */
  public static async streamCompletion(
    messages: { role: string; content: string }[],
    modelId: string,
    clientRes: Response
  ): Promise<void> {
    const apiKey = this.getApiKey();
    const baseUrl = this.getBaseUrl();

    console.info(`[AgentRouter] Route attempt using model: "${modelId}"`);

    // Call AgentRouter completions endpoint
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'https://localhost:3000',
        'X-Title': 'AgentRouter Premium Chat Hub',
      },
      body: JSON.stringify({
        model: modelId,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    });

    const contentType = response.headers.get('content-type') || '';

    // Check for authorization errors, rate limits, or network rejects
    if (!response.ok) {
      let errorMessage = `AgentRouter API returned status code ${response.status}`;
      try {
        const body = await response.json();
        if (body && body.error && body.error.message) {
          errorMessage = body.error.message;
        }
      } catch (e) {
        try {
          const text = await response.text();
          if (text && text.length < 250) {
            errorMessage = text;
          }
        } catch (e2) {}
      }
      throw new Error(errorMessage);
    }

    if (
      contentType.includes('text/html') ||
      contentType.includes('application/xhtml+xml')
    ) {
      throw new Error(`The request was blocked or redirected by the network security firewall (WAF). Status code: ${response.status}.`);
    }

    if (!response.body) {
      throw new Error('The AgentRouter API returned an empty response stream.');
    }

    // Inform client of streaming response
    clientRes.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering on modern proxies (like Nginx, Cloudflare)
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const dataStr = trimmed.slice(6);
              const parsed = JSON.parse(dataStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                clientRes.write(content);
              }
            } catch (jsonErr) {
              console.warn('Skipping unparsable stream line:', trimmed);
            }
          }
        }
      }

      // Read final leftovers
      if (buffer && buffer.startsWith('data: ')) {
        try {
          const dataStr = buffer.slice(6);
          const parsed = JSON.parse(dataStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            clientRes.write(content);
          }
        } catch (e) {}
      }
    } catch (streamErr: any) {
      console.error('[AgentRouter Stream Processing Error]:', streamErr.message || streamErr);
      throw streamErr;
    } finally {
      if (!clientRes.writableEnded) {
        clientRes.end();
      }
    }
  }
}
