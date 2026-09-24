# 🚀 AgentRouter AI Chat Hub

A complete, production-ready full-stack AI chat application designed with exceptionally premium SaaS aesthetics, robust model isolation, and zero-leak credential architecture. It interfaces directly with AgentRouter models while strictly isolating all API keys on the server.

---

## 🛠️ Centralized Model Configuration

The application is configured to run exactly the four authorized AgentRouter models without any arbitrary overrides:

1. **Claude Opus 4.8**
   - ID: `claude-opus-4-8`
   - description: *"Advanced reasoning, writing, analysis and complex tasks."*
2. **Claude Opus 5**
   - ID: `claude-opus-5`
   - description: *"Advanced reasoning, long-form work and difficult problems."*
3. **DeepSeek V4 Flash**
   - ID: `deepseek-v4-flash`
   - description: *"Fast responses and efficient everyday AI tasks."*
4. **GPT-6 Astra**
   - ID: `gpt-6-astra`
   - description: *"General-purpose reasoning, coding, analysis and creative tasks."*

---

## 📂 System & Security Architecture

```
[User Browser]
      │
      │ 1. POST /api/chat { model: "claude-opus-4-8", messages: [...] }
      ▼
[Express Server] (Validates schema, limits sizes, checks allowlist)
      │
      │ 2. POST https://co.agentrouter.org/v1/chat/completions (Bearer AGENTROUTER_API_KEY)
      ▼
[AgentRouter] (Generates real stream chunks)
      │
      │ 3. Returns chunked Server-Sent Events (SSE)
      ▼
[Express Server] (Parses stream lines, extracts text content, streams to client)
      │
      │ 4. Plain-text chunked stream
      ▼
[User Browser] (Appends content to UI & auto-scrolls)
```

1. **Strict Key Containment**: The `AGENTROUTER_API_KEY` exists *exclusively* on the server environment. It is never exposed in browser JavaScript, React, HTML, localStorage, or client-side logs.
2. **Backend Validation Allowlist**: The server maintains a strict allowlist. If a request is received with an arbitrary model, the endpoint immediately returns `400 Bad Request` with `"Selected model is not available."` preventing arbitrary endpoint exploitation.
3. **Optimized Stream Routing**: Streamed text deltas are cleanly forwarded from AgentRouter back to the client as low-overhead text streams, reducing client buffer load.

---

## 💻 Installation & Local Development

Follow these steps to run the application locally:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root folder (referenced from `.env.example`):
```bash
cp .env.example .env
```
Add your AgentRouter API key:
```env
AGENTROUTER_API_KEY=your_actual_agentrouter_key_here
```

### 3. Spin up Full-Stack Dev Server
Runs the Node.js Express API server with Vite middle-layer hot reloading:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your browser.

---

## ☁️ Deploying to Vercel

The application is structured as a full-stack Express & React Node.js app, fully ready for Vercel Serverless deployments.

### 1. Build Static Assets
Ensure your static React asset bundles compile cleanly:
```bash
npm run build
```

### 2. Adding Vercel Environment Variables
Go to your project settings in the **Vercel Dashboard**:
1. Select **Settings** > **Environment Variables**.
2. Add a new variable:
   - Key: `AGENTROUTER_API_KEY`
   - Value: `<Your Actual AgentRouter API Key>`
3. Set `NODE_ENV` to `production`.

### 3. Deploy Command
Run the Vercel deployment command or link your GitHub repository to trigger continuous deployments on git push:
```bash
vercel --prod
```

---

## 📊 Backend Routing `/api/chat` Details

- **Method**: `POST`
- **Path**: `/api/chat`
- **Request Body**:
  ```json
  {
    "model": "claude-opus-4-8",
    "messages": [
      { "role": "user", "content": "Hello" }
    ]
  }
  ```
- **Validation Rules**:
  - `model` must be exactly one of the allowlist keys.
  - `messages` must be a valid array under 100 items.
  - Total length of any individual message must be under 24,000 characters.
  - Basic rate limiting is enforced to prevent API spamming or denial of service.

---

*Designed with high-fidelity visual discipline, clean margins, and solid security practices.*
