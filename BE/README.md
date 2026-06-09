# Backend — Chat MVP REST API (Week 3)

Express + TypeScript REST API that powers the Frontend Chat MVP. Storage is
in-memory (no database yet). The API contract is documented in
[`../API_CONTRACT.md`](../API_CONTRACT.md), which is the shared source of truth.

## Requirements

- Node.js (tested on v26)
- npm

## Setup

```bash
cd BE
npm install
```

Configuration is read from environment variables (see [`.env.example`](./.env.example)):

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `4000` | Port the API listens on |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Origin allowed by CORS (the FE dev server) |

Both have sensible defaults, so the server runs with no env file. Override them
inline when needed, e.g. `PORT=5000 npm run dev`.

## Scripts

```bash
npm run dev        # start with reload (tsx watch)
npm run build      # compile TypeScript to dist/
npm start          # run the compiled server (after build)
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint (type-checked rules)
npm test           # Vitest (unit + endpoint tests)
npm run test:watch # Vitest in watch mode
```

## Architecture

Requests flow strictly through layers; no layer skips ahead:

```
route → middleware (auth/validation) → controller → service → data store
```

- Controllers only translate HTTP ↔ typed input and never touch the store.
- Services own all business logic and are the only callers of the store.
- The store is the single owner of in-memory state.

```
src/
  server.ts                 # entry point: load env, start listening
  app.ts                    # builds the Express app (no listen) — testable
  config/env.ts             # Zod-validated environment, fail-fast
  domain/types.ts           # User, Message, Conversation, ConversationPreview
  data/
    store.ts                # in-memory Maps — single data owner (+ resetStore)
    seed.ts                 # seeded users + conversations + messages
  shared/
    ApiError.ts             # typed error + status/code factories
    errorCodes.ts           # all error codes (one source of truth)
    validation.ts           # parseRequest: Zod → typed input or 400
    ordering.ts             # message ordering helper
  middleware/
    requestLogger.ts        # logs method + path + status + duration
    authenticate.ts         # Bearer token → req.userId, else 401
    notFoundHandler.ts      # unmatched route → 404
    errorHandler.ts         # the only place that builds the error body
  modules/
    auth/                   # POST /auth/login
    conversations/          # GET + POST /conversations
    messages/               # GET + POST /conversations/:id/messages (+ pagination)
  types/express.d.ts        # adds req.userId
```

## Endpoints

Base path `/api`. All routes except login require `Authorization: Bearer <token>`.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Mock login: `{ userId }` → `{ token, user }` |
| `GET` | `/api/conversations` | List the user's conversations, newest activity first |
| `POST` | `/api/conversations` | Create a conversation (`409` on duplicate participants) |
| `GET` | `/api/conversations/:id/messages?cursor=&limit=` | Paginated message history |
| `POST` | `/api/conversations/:id/messages` | Send a message (idempotent via `clientMessageId`) |

Errors use a consistent shape:

```json
{ "error": { "code": "ERROR_CODE", "message": "Human-readable message", "details": {} } }
```

See [`../API_CONTRACT.md`](../API_CONTRACT.md) for full request/response details
and status codes.

## Notes

- **In-memory only.** State resets every time the server restarts; the store is
  reseeded with users Alice, Bob, and Carol plus three conversations.
- **Auth is a mock.** `POST /auth/login` issues an opaque token bound to a user
  id; there is no password yet (that arrives Week 4).
- **Server owns message ids.** `clientMessageId` is only an idempotency key — a
  resend with the same key returns the original message.
