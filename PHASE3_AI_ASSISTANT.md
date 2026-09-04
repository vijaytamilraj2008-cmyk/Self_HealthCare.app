# Phase 3 – Improved AI Health Assistant

Phase 3 builds directly on Phase 2.

## What changed

The AI Assistant now uses a backend orchestration endpoint:

`POST /api/ai/chat`

The Spring Boot service performs a safety-first flow:

1. Emergency triage runs before normal AI processing.
2. The authenticated user's profile is read from MySQL.
3. Recent medical documents, appointments and timeline events are read from MySQL.
4. Up to the most recent 10 chat messages are supplied as conversation context.
5. If an AI provider is configured, the backend sends the minimum relevant context to an OpenAI-compatible chat-completions endpoint.
6. If no provider is configured or the provider fails, a safe contextual fallback answers supported questions using MySQL data.
7. Both the user's message and the assistant's answer are saved to MySQL in one transaction.

## Optional AI provider configuration

The application works without a provider. For a production-quality generative assistant, configure these environment variables before starting Spring Boot:

```text
AI_API_URL=https://your-openai-compatible-provider.example
AI_API_KEY=your-server-side-key
AI_MODEL=your-model-name
```

The backend appends `/v1/chat/completions` to `AI_API_URL` and never exposes `AI_API_KEY` to the React application.

Do not put the AI key in Vite `.env` files or frontend source code.

## Safety design

The assistant is explicitly instructed not to diagnose, prescribe, change medicine doses, or claim certainty. Emergency-like messages are handled by the application's safety response before the model is called.

This remains a health-literacy assistant and is not a replacement for a clinician or emergency service.

## Frontend change

The React AI page no longer calls `saveMessage()` separately for each turn. It sends one request to `/api/ai/chat`; the backend persists both sides of the conversation atomically. This prevents duplicate messages and keeps the AI context on the server.

## Phase 2 compatibility

Existing Phase 2 conversation/history endpoints remain available, so previously saved chat history remains readable.
