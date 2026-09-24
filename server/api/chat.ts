import { Router, Request, Response } from 'express';
import { ALLOWED_MODELS } from '../config/models';
import { validateChatPayload, rateLimiter } from '../middleware/validation';
import { AgentRouterService } from '../services/agentRouter';

const router = Router();

// Endpoint: Retrieve supported models list (strips out any potential sensitive IDs or providers)
router.get('/models', (req: Request, res: Response) => {
  try {
    const modelsList = Object.values(ALLOWED_MODELS);
    return res.status(200).json({ models: modelsList });
  } catch (err: any) {
    console.error('Error in /api/models endpoint:', err);
    return res.status(500).json({ error: { message: 'Failed to retrieve available models from the server.' } });
  }
});

// Endpoint: Chat completions using secure AgentRouter forwarding
router.post('/chat', rateLimiter, validateChatPayload, async (req: Request, res: Response): Promise<any> => {
  const { messages, model } = req.body;

  try {
    // Forward the prompt cleanly and stream direct characters
    await AgentRouterService.streamCompletion(messages, model, res);
  } catch (err: any) {
    console.error('[Error in /api/chat]:', err.message || err);

    // If headers were already written, we must let the client know of stream break
    if (res.headersSent) {
      if (!res.writableEnded) {
        res.write('\n\n[Streaming Connection Error: The connection was interrupted on the server. Please check status.]');
        res.end();
      }
      return;
    }

    // Friendly error mappings ensuring absolutely zero leaks of actual internal configurations or keys
    let errorMessage = 'An unexpected server error occurred while contacting the AI agent.';
    let statusCode = 500;

    if (err.message && err.message.includes('AGENTROUTER_API_KEY')) {
      errorMessage = 'AgentRouter service API key is missing on the host. Please define it in your backend environment configuration.';
    } else if (err.message && err.message.includes('Unauthorized')) {
      errorMessage = 'The server was unable to authenticate with the AgentRouter service. Please verify the API key.';
      statusCode = 401;
    } else if (err.message && err.message.includes('temporarily unavailable')) {
      errorMessage = err.message;
      statusCode = 404;
    } else if (err.message && err.message.includes('Too Many Requests')) {
      errorMessage = 'Rate limit reached. Please wait a moment before sending more queries.';
      statusCode = 429;
    } else if (err.message) {
      errorMessage = err.message;
    }

    return res.status(statusCode).json({
      error: { message: errorMessage }
    });
  }
});

export default router;
