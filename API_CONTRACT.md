# API Contract — Week 2 Chat MVP

Base URL: `/api` (mocked via MSW in Week 2; real backend in Week 3).

All authenticated requests require:

```
Authorization: Bearer <token>
```

Errors use JSON body:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

`details` is optional and may hold validation or debug context.

---

## Types

### User

```ts
type User = {
  id: string
  displayName: string
  avatarUrl?: string
}
```

### Message

```ts
type Message = {
  id: string
  conversationId: string
  senderId: string // the reserved id "assistant" for AI replies
  body: string
  createdAt: string // ISO 8601
  metadata?: {
    replyToMessageId?: string // set on assistant replies — the user message they answer
  }
}
```

### ConversationPreview

```ts
type ConversationType = 'direct' | 'assistant' | 'tutor' // 'tutor' reserved, not yet produced

type ConversationPreview = {
  id: string
  type: ConversationType
  title: string
  participantIds: string[]
  lastMessage: Pick<Message, 'body' | 'createdAt' | 'senderId'> | null
  updatedAt: string // ISO 8601 — sort key for conversation list
}
```

---

## Endpoints

### `POST /api/auth/login`

Mock login — pick a user identity. No password.

**Request**

```ts
{ userId: string }
```

**Response `200`**

```ts
{ token: string; user: User }
```

**Errors**

| Status | When |
|--------|------|
| 404 | Unknown `userId` (`USER_NOT_FOUND`) |

---

### `GET /api/conversations`

List conversations the current user participates in, sorted by `updatedAt` descending.

**Response `200`**

```ts
{ conversations: ConversationPreview[] }
```

**Errors**

| Status | When |
|--------|------|
| 401 | Missing or invalid token (`UNAUTHORIZED`) |

---

### `GET /api/conversations/:id/messages`

Paginated messages for a conversation. Messages are **ascending** by `createdAt` (oldest first within the page).

**Query parameters**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `cursor` | string | — | Opaque cursor from previous response; omit for the latest page |
| `limit` | number | 50 | Max messages per page |

**Response `200`**

```ts
{
  messages: Message[]
  nextCursor: string | null // null when no older messages exist
}
```

**Pagination semantics**

- First request (no `cursor`): returns the **most recent** `limit` messages.
- With `cursor`: returns the next older page.
- `nextCursor` is `null` when there are no more older messages.

**Errors**

| Status | When |
|--------|------|
| 401 | Unauthorized |
| 403 | User not a participant (`FORBIDDEN`) |
| 404 | Unknown conversation |
| 400 | Invalid pagination cursor (`INVALID_CURSOR`) |

---

### `POST /api/conversations/:id/messages`

Create a message in a conversation.

**Request**

```ts
{
  body: string
  clientMessageId?: string // optional idempotency key from client
}
```

**Response `201`**

```ts
{ message: Message }
```

**Simulated failure (non-production dev hook)**

When a request carries header `X-Simulate-Failure: 1`, the backend returns **500** with the `SIMULATED_SEND_FAILURE` error shape. The hook is ignored in production. No client sends this header; it exists for manual/automated testing of the send-failure path.

**Errors**

| Status | When |
|--------|------|
| 400 | Empty `body` |
| 401 | Unauthorized |
| 403 | Not a participant |
| 404 | Unknown conversation |
| 500 | Simulated failure (`SIMULATED_SEND_FAILURE`, non-production dev hook) |

---

## Assistant conversations (Week 6)

### `POST /api/conversations` (assistant variant)

Create an AI chat. The creator is the sole participant; multiple assistant conversations per user are allowed.

**Request**

```ts
{ type: 'assistant'; title?: string } // no participantEmails; title defaults to "AI Assistant"
```

**Response `201`**: `{ conversation: ConversationPreview }` (with `type: 'assistant'`).

The existing `{ participantEmails: string[]; title? }` body still creates a `direct` conversation.

### `POST /api/conversations/:id/messages` (assistant streaming)

When `:id` is an **assistant** conversation, the response is a **Server-Sent Events** stream (`Content-Type: text/event-stream`) instead of JSON. The request body is unchanged (`{ body, clientMessageId? }`).

Pre-stream failures (auth, participant, validation) are returned as normal JSON + HTTP status before the stream begins. Once the stream starts (HTTP `200`), failures arrive as an `error` event.

**SSE events** (a tolerant client must ignore unknown event names):

```
event: user_message   data: { "message": Message }          // the persisted user message
event: token          data: { "text": string }              // assistant reply delta (repeated)
event: tool           data: { "name": string }              // a tool the assistant invoked
event: done           data: { "message": Message }          // the persisted assistant reply
event: error          data: { "code": "ASSISTANT_UNAVAILABLE", "message": string }
```

- The assistant reply is persisted only after streaming completes; a client disconnect cancels generation and persists nothing.
- Idempotent retry: re-posting the same `clientMessageId` replays the existing exchange (`user_message` then `done`) without a new LLM call.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-27 | Initial contract for Week 2 MVP |
| 2026-05-27 | Structured error shape; `INVALID_CURSOR` returns 400 |
| 2026-06-16 | Week 5: backend moved to MongoDB persistence — contract unchanged |
| 2026-06-25 | Week 6: `ConversationType`; assistant conversations; SSE streaming reply with tool calls; optional `Message.metadata` |
