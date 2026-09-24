import { Request, Response, NextFunction } from 'express';
import { ALLOWED_MODELS } from '../config/models';

// Basic in-memory rate limiter to prevent denial of service (DoS)
const ipRequestCounts: Record<string, { count: number; resetTime: number }> = {};
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests/minute per IP

export function rateLimiter(req: Request, res: Response, next: NextFunction): any {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  if (!ipRequestCounts[ip]) {
    ipRequestCounts[ip] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    return next();
  }

  const record = ipRequestCounts[ip];
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
    return next();
  }

  record.count += 1;
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: {
        message: 'Too many requests. Please wait a moment before sending more messages.'
      }
    });
  }

  next();
}

// Security: Validate the chat payload strictly
export function validateChatPayload(req: Request, res: Response, next: NextFunction): any {
  const { messages, model } = req.body;

  // 1. Check model
  if (!model) {
    return res.status(400).json({
      error: { message: 'Missing "model" parameter.' }
    });
  }

  if (!ALLOWED_MODELS[model]) {
    return res.status(400).json({
      error: { message: 'Selected model is not available.' }
    });
  }

  // 2. Check messages array
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({
      error: { message: 'Invalid payload: "messages" must be an array.' }
    });
  }

  if (messages.length === 0) {
    return res.status(400).json({
      error: { message: 'Invalid payload: "messages" cannot be empty.' }
    });
  }

  if (messages.length > 100) {
    return res.status(400).json({
      error: { message: 'Conversation history exceeds the maximum limit of 100 messages.' }
    });
  }

  // 3. Check individual message shapes
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg || typeof msg !== 'object') {
      return res.status(400).json({
        error: { message: `Message at index ${i} is invalid.` }
      });
    }

    if (msg.role !== 'user' && msg.role !== 'assistant' && msg.role !== 'system') {
      return res.status(400).json({
        error: { message: `Message at index ${i} has an invalid role. Allowed: user, assistant, system` }
      });
    }

    if (typeof msg.content !== 'string') {
      return res.status(400).json({
        error: { message: `Message content at index ${i} must be a string.` }
      });
    }

    if (msg.content.length > 24000) {
      return res.status(400).json({
        error: { message: `Message content at index ${i} exceeds the size limit of 24,000 characters.` }
      });
    }
  }

  next();
}
