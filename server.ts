import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import apiRouter from './server/api/chat';

// Load environment variables
dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

// Security: limit body parsing payloads (protect against large body overflow vectors)
app.use(express.json({ limit: '500kb' }));

// Mount secure API routes
app.use('/api', apiRouter);

// --- PLATFORM INTEGRATION (VITE / STATIC ASSETS) ---
if (isProd) {
  // In production, serve the pre-built files from dist
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  // In development, spin up Vite dynamic middleware
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  
  app.use(vite.middlewares);
  console.log('Vite development middleware mounted successfully on API Server.');
}

app.listen(PORT, () => {
  console.log(`[Server] Production-ready full-stack server running on http://localhost:${PORT}`);
});
