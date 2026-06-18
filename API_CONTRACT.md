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
  senderId: string
  body: string
  createdAt: string // ISO 8601
}
```

### ConversationPreview

```ts
type ConversationPreview = {
  id: string
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

**Simulated failure (Week 2 mock only)**

When the client sends header `X-Simulate-Failure: 1`, the mock returns **500** with `{ "error": "Simulated send failure" }`.

**Errors**

| Status | When |
|--------|------|
| 400 | Empty `body` |
| 401 | Unauthorized |
| 403 | Not a participant |
| 404 | Unknown conversation |
| 500 | Simulated failure (`SIMULATED_SEND_FAILURE`, dev toggle) |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-27 | Initial contract for Week 2 MVP |
| 2026-05-27 | Structured error shape; `INVALID_CURSOR` returns 400 |
| 2026-06-16 | Week 5: backend moved to MongoDB persistence — contract unchanged |
