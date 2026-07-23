# Chat App

Full-stack chat application: a React + Vite + TypeScript frontend and a NestJS +
MongoDB backend. [`API_CONTRACT.md`](./API_CONTRACT.md) is the shared source of
truth for every endpoint, request/response shape, and error code.

- [`FE/`](./FE) — React SPA (typed `apiClient`, feature-based components).
- [`BE/`](./BE) — NestJS REST API over MongoDB. See [`BE/README.md`](./BE/README.md).

## Features

- **Auth** — email/password signup + login, JWT access tokens.
- **Direct chat** — conversations, cursor-paginated message history, send idempotency.
- **Assistant chat** — streamed (SSE) assistant replies with tool calls.
- **Tutor (RAG)** — per-user knowledge base answered via MongoDB Atlas Vector Search.
- **Account & profile** — profile edits, avatar upload, confirmation-based email change.
- **Password reset** — unauthenticated flow: request an emailed one-time code, then
  set a new password. A successful reset consumes the code and invalidates all
  existing sessions.

## Quickstart

```bash
# 1. Start MongoDB (data persists in a named volume)
docker compose up -d

# 2. Backend
cd BE
npm install
cp .env.example .env   # then review the values
npm run dev            # http://localhost:4000

# 3. Frontend (in a second terminal)
cd FE
npm install
npm run dev            # http://localhost:5173
```

The backend fails fast on boot if required environment variables are missing;
see [`BE/README.md`](./BE/README.md) for the full configuration table (JWT, Mongo,
OpenAI, Atlas vector index) and the Atlas-only tutor setup.

## Scripts

Both packages expose the same script names:

```bash
npm run dev        # dev server (FE: Vite; BE: nest --watch)
npm run build      # production build
npm test           # Vitest
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
```

## Architecture

**Backend** requests flow strictly through layers, no layer skips ahead:

```
controller → orchestrator (use case) → domain service → repository (DAO) → MongoDB
```

Only repositories touch Mongoose; domain records (never raw documents) cross layer
boundaries. See [`BE/README.md`](./BE/README.md) for details, schemas, and indexes.

**Frontend** is feature-based, with presentational components split from containers:

- `src/api/` — typed `apiClient` (single HTTP surface) + response parsers.
- `src/features/` — feature folders (`auth`, `password-reset`, `email-change`, …),
  each with presentational components, containers, hooks, and local constants.
- `src/app/` — routes and top-level composition.
- `src/context/` — auth, toasts, and other cross-feature state.
