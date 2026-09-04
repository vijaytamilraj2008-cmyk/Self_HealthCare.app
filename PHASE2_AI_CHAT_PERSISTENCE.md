# Phase 2 - AI Chat History Persistence

Phase 2 builds on `HealthcareProject_Phase1_Fixed.zip`.

## What changed

The AI Health Assistant now persists conversation history in MySQL through Spring Boot APIs.

### Backend

- `AiConversation` entity -> `ai_conversations` table
- `AiMessage` entity -> `ai_messages` table
- `AiConversationRepository`
- `AiMessageRepository`
- `AiConversationService`
- `AiConversationController`
- DTOs for conversation/message creation

### API

- `GET /api/ai/conversations`
- `POST /api/ai/conversations`
- `GET /api/ai/conversations/{conversationId}/messages`
- `POST /api/ai/conversations/{conversationId}/messages`

All endpoints are authenticated through the existing JWT security filter. A user can only access conversations belonging to their own account.

### Frontend

`aiService.ts` now:

1. Loads the latest conversation after login.
2. Creates a conversation automatically for a first-time user.
3. Loads saved messages from the backend.
4. Saves each user message to the backend.
5. Generates the existing safe/rule-based AI response.
6. Saves the AI response to the backend.

`AiAssistantPage.tsx` now restores history when the page opens, so the same conversation can be seen after logging in from another device.

## What remains for Phase 3

The chatbot's response engine is still the existing safe rule-based assistant. Phase 3 can add a proper AI/retrieval layer while keeping the emergency guardrails and backend-persisted chat history.
