# GYB Studio AI Chat

This project couples a Vite/React frontend with a Node proxy that streams OpenAI chat completions. Use the steps below to get the chat AI integration running locally.

## Environment Variables

### Server (`project/backend/.env` or shell)

| Key | Description | Example |
| --- | --- | --- |
| `OPENAI_API_KEY` | OpenAI (or provider) API key used by the proxy | `sk-your-key` |
| `CHAT_API_BASE` | Provider base URL (must include `/v1` for OpenAI) | `https://api.openai.com/v1` |
| `MODEL_NAME` | Default chat model served by the proxy | `gpt-4o-mini` |
| `PORT` | Port the Node backend listens on | `8080` |

The backend validates these on startup and exits if any are missing.

### Client (`project/.env`)

| Key | Description | Example |
| --- | --- | --- |
| `VITE_CHAT_API_BASE` | URL the frontend uses to reach the backend | `http://localhost:8080` |
| `VITE_MODEL_NAME` | Chat model hint sent by the client | `gpt-4o-mini` |

The frontend fails fast and logs an explicit error when either value is undefined.

## Development Workflow

1. **Install dependencies**
   ```bash
   cd project
   npm install
   ```
2. **Start the backend proxy**
   ```bash
   cd backend
   node server.js
   ```
   (Use `nodemon server.js` for auto-reload during development.)
3. **Start the Vite dev server**
   ```bash
   cd ..
   npm run dev
   ```

The chat UI expects the backend at `http://localhost:8080` and the Vite app at `http://localhost:3002`.

## Troubleshooting

- **CORS failures**: Confirm `CHAT_API_BASE` and `VITE_CHAT_API_BASE` point to the same origin and the backend is running. The server allows `http://localhost:3000-3002` by default.
- **Proxy not forwarding**: Ensure the Vite dev proxy (`/api`) targets the backend origin. Update `VITE_CHAT_API_BASE` before running `npm run dev`.
- **Missing environment variables**: Startup errors will list the missing keys. Add them to the respective `.env` file and restart both processes.
- **Network timeouts**: The frontend aborts chat requests after 30 s. Check connectivity with the in-app **Run connectivity test** button (available in development mode) or query `http://localhost:8080/health` directly.
- **Provider errors**: The chat window displays the HTTP status and reason. Use the Retry button to resend the most recent prompt once the backend is available again.

For additional diagnostics, watch the browser console (`[chat] start/response/error` logs) and the backend console (per-request structured logs including latency and request IDs).

