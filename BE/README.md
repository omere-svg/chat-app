# Backend — Chat MVP REST API (Week 5)

NestJS + TypeScript REST API that powers the Frontend Chat MVP, backed by
MongoDB (via `@nestjs/mongoose`). Data survives server restarts. The API contract
is documented in [`../API_CONTRACT.md`](../API_CONTRACT.md), which is the shared
source of truth.

## Requirements

- Node.js (tested on v26)
- npm
- MongoDB — use the bundled `docker compose` service, or a MongoDB Atlas cluster.

## Setup

```bash
# from the repo root: start a local MongoDB (data persists in a named volume)
docker compose up -d

cd BE
npm install
cp .env.example .env   # then review the values
npm run dev
```

Configuration is read from environment variables (see [`.env.example`](./.env.example)):

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `4000` | Port the API listens on |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Origin allowed by CORS (the FE dev server) |
| `JWT_SECRET` | — | Secret used to sign/verify JWT access tokens (≥ 32 chars) |
| `JWT_EXPIRES_IN` | `3600` | Access-token lifetime in seconds |
| `MONGO_URI` | `mongodb://localhost:27017/chat` | MongoDB connection string |
| `OPENAI_API_KEY` | — | OpenAI key for assistant replies, tutor answers, and embeddings |
| `ASSISTANT_MODEL` | `gpt-4o-mini` | Chat model for assistant + tutor replies |
| `EMBEDDINGS_MODEL` | `text-embedding-3-small` | Embedding model (1536 dims) for the knowledge base |
| `ATLAS_VECTOR_INDEX` | `knowledge_chunks_vector_index` | Name of the Atlas Vector Search index |
| `PAYMENT_PROVIDER_KIND` | `fake` | PRO checkout provider: `rapyd` (hosted checkout) or `fake` (offline) |
| `RAPYD_ACCESS_KEY` / `RAPYD_SECRET_KEY` | — | Rapyd API credentials (required in prod when `rapyd`) |
| `RAPYD_BASE_URL` | `https://sandboxapi.rapyd.net` | Rapyd API base URL |
| `RAPYD_WEBHOOK_SECRET` | — | Secret used to verify inbound Rapyd webhook signatures |
| `PAYMENT_QUEUE_KIND` | `fake` | Payment-event queue: `sqs` (AWS SQS + DLQ) or `fake` (in-memory) |
| `SQS_PAYMENT_QUEUE_URL` | — | SQS queue URL for payment events (required in prod when `sqs`) |

The environment is validated on boot (`config/environment.schema.ts`); the server
fails fast with a clear message if anything is missing or malformed.

### PRO subscription (payments) — Week 8.2

Users can upgrade to a PRO plan. Plan pricing is stored in MongoDB (seeded on boot, then
editable directly in the DB — nothing hardcoded), exposed via `GET /users/plans`.
`POST /users/plans/payment-session` opens a Rapyd hosted-checkout session and records a
`pending` payment session; the browser is redirected to the provider. Rapyd then calls the
**public, signature-verified** `POST /users/plans/webhook`, which enqueues the event to SQS
and returns fast. A background consumer (`payment-event-consumer`) long-polls SQS and
processes each event **idempotently** (a payment session moves `pending → completed/failed`
once), activating the subscription on success. Transient failures are retried by SQS and
land in a **DLQ** after `maxReceiveCount`. Both the provider and the queue sit behind Symbol
ports, so `PAYMENT_PROVIDER_KIND=fake` / `PAYMENT_QUEUE_KIND=fake` run the whole flow
offline for local dev and tests.

### Knowledge base / tutor (RAG) — requires Atlas

The tutor (`type: 'tutor'`) conversation answers from a per-user knowledge base backed
by **MongoDB Atlas Vector Search**. Local Mongo does **not** support `$vectorSearch`, so
tutor retrieval needs an Atlas cluster (`MONGO_URI=mongodb+srv://…`). The vector index is
defined in the repo (`knowledge/atlas/vector-index.config.ts`) and provisioned with:

```bash
MONGO_URI="mongodb+srv://…" npm run provision:vector-index   # idempotent
```

The other features (direct + assistant chat) work against local Mongo unchanged.

## Scripts

```bash
npm run dev        # start with reload (nest start --watch)
npm run build      # compile TypeScript to dist/
npm start          # run the compiled server (after build)
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint (type-checked rules)
npm test           # Vitest — unit specs + e2e against an in-process MongoDB
npm run test:watch # Vitest in watch mode
npm run provision:vector-index  # create the Atlas Vector Search index (idempotent)
npm run eval                    # tutor retrieval-recall + answer-quality eval (needs Atlas + OpenAI)
```

Tests need no running database: the e2e suite spins up
[`mongodb-memory-server`](https://github.com/typegoose/mongodb-memory-server) and
exercises the real Mongo DAOs.

## Architecture

Requests flow strictly through layers; no layer skips ahead:

```
controller → orchestrator (use case) → domain service → repository (DAO) → MongoDB
```

- **Controllers** translate HTTP ↔ typed input and return DTOs — never raw
  Mongoose documents.
- **Orchestrators** (`chat/use-cases/*`) coordinate multiple domain services for a
  single endpoint. They hold no business rules.
- **Domain services** own their aggregate's business logic and depend on a
  repository *port* (an interface), never on Mongoose directly.
- **Repositories (DAOs)** are the only code that touches Mongoose. They map
  documents to plain domain records, so `_id`/`__v` never escape this layer.

```
src/
  main.ts                          # bootstrap: env, CORS, global pipes/filter
  app.module.ts                    # wires ConfigModule + MongooseModule + features
  config/                          # validated environment (fail-fast)
  database-seed/
    database-seed.module.ts        # wires the demo-data seeder
    demo-data.seeder.ts            # env-gated demo seeding (skipped in production)
  shared/
    errors/                        # structured error filter + error codes
    pagination/cursor-page.ts      # cursor page result types
    seed/chat-seed.ts              # demo users + conversations + messages
  users/
    user.schema.ts                 # Mongoose schema + unique email index
    repository/                    # UserRepository port + MongoUserRepository
    users.service.ts
  conversations/
    conversation.schema.ts         # schema + (participantIds, lastActivityAt) index
    repository/                    # ConversationRepository port + Mongo impl
    conversations.service.ts
  messages/
    message.schema.ts              # schema + (conversationId, createdAt) index
    repository/                    # MessageRepository port + Mongo impl
    messages.service.ts
  auth/                            # signup/login, JWT strategy + guard
  chat/                            # controllers, orchestrators, guards, mappers
```

### Schema & indexes

| Collection | Key fields | Index | Query it backs |
|------------|------------|-------|----------------|
| `users` | `_id, email, firstName, lastName, passwordHash, createdAt` | `email` (unique) | login / signup / participant lookup |
| `conversations` | `_id, title, participantIds, lastActivityAt, lastMessage, createdAt` | `(participantIds, lastActivityAt desc)` | "list my conversations by last activity" |
| `messages` | `_id, conversationId, senderId, body, createdAt, clientMessageId?` | `(conversationId, createdAt desc, _id desc)` | message history + cursor pagination |
| `messages` | — | `(conversationId, clientMessageId)` unique partial | send idempotency |

`conversations.lastMessage` is an **embedded snapshot** of the newest message, so
the conversation list resolves in a single indexed query with no per-conversation
message reads. Sending a message persists the message, then advances the parent
conversation's `lastActivityAt`/`lastMessage` with a monotonic, single-document
update.

## Notes

- **IDs are application-assigned strings** (`user-…`, `conv-…`, `msg-…`) stored as
  `_id`, preserving the API contract and stable, human-readable references.
- **Demo data is seeded only outside production, and only when a collection is empty**
  (users Alice, Bob, Carol plus three conversations), so restarts never clobber real data.
- **Server owns message ids.** `clientMessageId` is only an idempotency key — a
  resend with the same key returns the original message.
