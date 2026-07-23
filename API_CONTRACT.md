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
  email?: string
  firstName: string
  lastName: string
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
    citations?: Citation[] // set on tutor replies — the source chunks the answer used
  }
}
```

### Citation

A source chunk a tutor answer was grounded in. Persisted on the reply (survives reload)
and also streamed live (see the `citations` SSE event).

```ts
type Citation = {
  chunkId: string
  documentId: string
  documentName: string
  text: string // the chunk text, so the client can show the source inline
  score: number // cosine similarity to the question, 0..1
}
```

### ConversationPreview

```ts
type ConversationType = 'direct' | 'assistant' | 'tutor' // 'tutor' = RAG over the user's knowledge base

type ConversationParticipant = {
  id: string
  firstName: string
  lastName: string
  avatarUrl?: string | null
}

type ConversationPreview = {
  id: string
  type: ConversationType
  title: string
  participantIds: string[]
  participants: ConversationParticipant[] // resolved participant identities for rendering
  lastMessage: Pick<Message, 'body' | 'createdAt' | 'senderId'> | null
  updatedAt: string // ISO 8601 — sort key for conversation list
}
```

---

## Endpoints

### `POST /api/auth/login`

Authenticate with email + password.

**Request**

```ts
{ email: string; password: string }
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

## Account & profile

### `POST /api/auth/signup`

Create an account and start a session.

**Request**

```ts
{ email: string; password: string; firstName: string; lastName: string }
```

**Response `201`**: `{ token: string; user: User }`

**Errors**

| Status | When |
|--------|------|
| 400 | Missing/invalid fields (`VALIDATION_ERROR`) |
| 409 | Email already registered (`EMAIL_ALREADY_REGISTERED`) |

### `GET /api/me`

Return the authenticated user.

**Response `200`**: `User`. **Errors**: `401` when unauthenticated.

### `PATCH /api/me/profile`

Update the current user's first and last name.

**Request**

```ts
{ firstName: string; lastName: string }
```

**Response `200`**: the updated `User`.

**Errors**

| Status | When |
|--------|------|
| 400 | Blank first/last name (`VALIDATION_ERROR`) |
| 401 | Unauthorized |

### `GET /api/me/previous-emails`

Return the current user's previous-email history (read-only, newest last). A moving
window of up to 10 addresses. Kept off the shared `User` object so it is never exposed
for other users (e.g. conversation participants) and never bloats auth/`/me` payloads.

**Response `200`**

```ts
{ previousEmails: string[] }
```

**Errors**

| Status | When |
|--------|------|
| 401 | Unauthorized |

---

## Change email (confirmation flow)

Email changes are confirmed via a link sent to the **new** address. The request endpoint
issues a short-lived signed JWT (`{ userId, newEmail }`, ~30 min) carried in the link;
no server-side state is stored. The confirm endpoint verifies the token, re-checks the
address is still free, and atomically swaps the email — pushing the old one onto the
previous-emails list. A case-insensitive unique index on email is the final authority.

### `POST /api/me/email-change/request`

Start an email change. Validates the new email (format, not the current email, not already
taken) and emails a confirmation link to it.

**Request**

```ts
{ newEmail: string }
```

**Response `202`**

```ts
{ status: 'confirmation_sent' }
```

**Errors**

| Status | When |
|--------|------|
| 400 | Invalid email, or same as the current email (`VALIDATION_ERROR`) |
| 401 | Unauthorized |
| 409 | Email already registered to another account (`EMAIL_ALREADY_REGISTERED`) |

### `POST /api/email-change/confirm`

Public (the token is the authority; opened from the user's inbox). Verifies the token,
re-checks the address is free, and applies the change. Idempotent: replays/double-submits
are no-ops that return the already-updated user.

**Request**

```ts
{ token: string }
```

**Response `200`**: the updated `User`.

**Errors**

| Status | When |
|--------|------|
| 400 | Missing token, or invalid/expired token (`EMAIL_CHANGE_TOKEN_INVALID`) |
| 409 | The address was taken before confirmation (`EMAIL_ALREADY_REGISTERED`) |

---

## Password reset (unauthenticated OTP flow)

Reset without being logged in by proving inbox control with an emailed one-time code.
The request endpoint, when the account exists, generates a short-lived numeric OTP
(6 digits, ~10 min TTL, single-use, one active per user), stores only its hash, and emails
the code via AWS SES. Responses never reveal whether an account exists (no enumeration).
The confirm endpoint verifies the code, sets the new password, consumes the code, and
invalidates all existing sessions (JWTs issued before the reset are rejected).

### `POST /api/auth/password-reset/request`

Public. Always returns the same response whether or not the email matches an account.

**Request**

```ts
{ email: string }
```

**Response `202`**

```ts
{ status: 'reset_code_sent' }
```

**Errors**

| Status | When |
|--------|------|
| 400 | Invalid email format (`VALIDATION_ERROR`) |

### `POST /api/auth/password-reset/confirm`

Public. Verifies the code and sets the new password. Unknown email and wrong/expired/used
code return the same generic error (no enumeration).

**Request**

```ts
{ email: string; code: string; newPassword: string } // code is 6 numeric digits
```

**Response `200`**

```ts
{ status: 'password_reset' }
```

**Errors**

| Status | When |
|--------|------|
| 400 | Invalid body (`VALIDATION_ERROR`), or invalid/expired/used code or unknown account (`PASSWORD_RESET_CODE_INVALID`) |

After a successful reset, previously issued access tokens are rejected with `401`
(`UNAUTHORIZED`); the user must log in again.

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
event: tool_result    data: { "name": string }              // a tool the assistant finished running
event: citations      data: { "citations": Citation[] }     // tutor only — sources, before tokens
event: done           data: { "message": Message }          // the persisted assistant reply
event: error          data: { "code": "ASSISTANT_UNAVAILABLE", "message": string }
```

- The assistant reply is persisted only after streaming completes; a client disconnect cancels generation and persists nothing.
- Idempotent retry: re-posting the same `clientMessageId` replays the existing exchange (`user_message` then `done`) without a new LLM call.

---

## Knowledge base & tutor conversations (Week 7)

A **tutor** conversation answers using ONLY the authenticated user's uploaded documents
(a private, per-user knowledge base), with citations. Tutor chat reuses the assistant
streaming path; the only new wire addition is the `citations` SSE event above.

### `POST /api/conversations` (tutor variant)

```ts
{ type: 'tutor'; title? } // no participantEmails; title defaults to "AI Tutor"
```

**Response `201`**: `{ conversation: ConversationPreview }` (with `type: 'tutor'`). The
creator is the sole participant. Grounding: if no uploaded chunk is relevant to a
question, the tutor replies that it could not find the answer in the documents and the
reply carries **no** citations — no model is called, so it cannot hallucinate.

### `POST /api/knowledge/documents`

Upload a document into the current user's knowledge base and ingest it synchronously
(chunk → embed → store). `multipart/form-data` with a single file field named `file`.

- Supported formats: `.txt`, `.md`, `.markdown` (UTF-8 text). Max size **1,000,000 bytes**.
- Idempotent: re-uploading identical content returns the existing document (by content
  hash) and creates no duplicate chunks.

**Response `201`**

```ts
{ document: KnowledgeDocument }

type KnowledgeDocument = {
  id: string
  filename: string
  status: 'ready' | 'failed' // synchronous ingestion: 'ready' on success
  chunkCount: number
  byteSize: number
  createdAt: string // ISO 8601
}
```

**Errors**

| Status | When |
|--------|------|
| 400 | Missing/empty file, or file over the size limit (`VALIDATION_ERROR`) |
| 400 | Unsupported file type (`UNSUPPORTED_DOCUMENT`) |
| 401 | Unauthorized |

### `GET /api/knowledge/documents`

List the current user's uploaded documents, newest first.

**Response `200`**: `{ documents: KnowledgeDocument[] }`

### `DELETE /api/knowledge/documents/:id`

Remove a document and all of its chunks. Scoped to the owner.

**Response `204`** (no body).

**Errors**

| Status | When |
|--------|------|
| 401 | Unauthorized |
| 404 | Unknown document, or not owned by the user (`KNOWLEDGE_DOCUMENT_NOT_FOUND`) |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-27 | Initial contract for Week 2 MVP |
| 2026-05-27 | Structured error shape; `INVALID_CURSOR` returns 400 |
| 2026-06-16 | Week 5: backend moved to MongoDB persistence — contract unchanged |
| 2026-06-25 | Week 6: `ConversationType`; assistant conversations; SSE streaming reply with tool calls; optional `Message.metadata` |
| 2026-06-29 | Week 7: tutor (RAG) conversations; `/knowledge/documents` upload/list/delete; `Citation` + `Message.metadata.citations`; `citations` SSE event |
| 2026-07-16 | Profile: `User` now uses `firstName`/`lastName` (replaces `displayName`); added `PATCH /me/profile` and `PATCH /me/email` (password-confirmed); signup takes first/last name |
| 2026-07-20 | Week 8: replaced password-confirmed `PATCH /me/email` with the confirmation flow (`POST /me/email-change/request` + public `POST /email-change/confirm`); added `GET /me/previous-emails`; `User` shape unchanged |
| 2026-07-21 | Week 8.1: unauthenticated password reset via emailed OTP (`POST /auth/password-reset/request` + `POST /auth/password-reset/confirm`); a successful reset invalidates all existing sessions; `User` shape unchanged |
| 2026-07-23 | Removed the PRO subscription model — dropped `GET /users/plans`, `GET /users/subscription`, `POST /users/plans/payment-session`, and `POST /users/plans/webhook`; `User` shape unchanged |
