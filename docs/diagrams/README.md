# Avatar Feature — Architecture & Flow Diagrams

Diagrams for the "profile avatar upload" spec: upload a profile photo, show it everywhere
(topbar, sidebar, next to messages) with an initials placeholder, and support replace/remove.
Storage is AWS S3 (private) served through a CloudFront CDN using presigned uploads.

Each diagram has a `.mmd` source (Mermaid) and a rendered `.png`. To re-render:

```bash
cd docs/diagrams
npx -y @mermaid-js/mermaid-cli -i be-architecture.mmd -o be-architecture.png -b white -s 2
```

---

## 1. Backend architecture — `be-architecture.png`

The new backend pieces, arranged by layer: **Controller → Orchestrator → Service → Repository → DB/external**.

- **HTTP client (JWT)** — every avatar endpoint is behind the JWT auth guard; the user id comes from the token.
- **AvatarController** (`controllers` module) — thin HTTP layer, no logic. Exposes `POST /me/avatar/upload-url`, `PUT /me/avatar`, `DELETE /me/avatar` and delegates to orchestrators.
- **request-avatar-upload** (orchestrator module) — validates the requested content type and asks the storage port to presign a `PUT`; returns the upload ticket `{uploadUrl, key, expiresInSeconds}`.
- **set-avatar** (orchestrator module) — the confirmation step. Checks the key belongs to the user, that the object actually exists (`headObject`), and re-validates size + type; persists the key and deletes the previous object if the photo was replaced.
- **remove-avatar** (orchestrator module) — clears the stored key and deletes the object from storage.
- **ObjectStorage port + OBJECT_STORAGE token** (`object-storage` module) — the storage abstraction orchestrators depend on. Never the AWS SDK directly.
- **S3ObjectStorage impl** — the concrete AWS adapter (`createUploadUrl` / `headObject` / `deleteObject`). Bound to the port token; swappable for another provider later.
- **UsersService** (`users` entity module) — owns user data: `updateAvatar`, `clearAvatar`, `getAvatarKey`, and `toPublicView` (attaches the resolved URL to every `PublicUser`).
- **AvatarUrlResolver** — converts a stored `avatarKey` into a full absolute `https://<cdn>/<key>` URL at read time.
- **avatar/ helpers** — `avatar-key.ts` (deterministic key building + ownership check), `constants.ts` (size limit, allowed types, key prefix), `types/`.
- **avatar/errors/** — typed exceptions (`AvatarKeyForbidden`, `AvatarObjectNotFound`, `AvatarTooLarge`, `UnsupportedImageType`) mapped by the global exception filter.
- **UserRepository port + user.mongo.repository** — the only DB-touching layer; the Mongo document now carries `avatarKey`.
- **config** — `AVATAR_CDN_BASE_URL`, `S3_AVATAR_BUCKET`, AWS region/credentials (validated at boot).
- **AWS S3 (private bucket)** and **MongoDB (`users.avatarKey`)** — external systems.

Key idea: the DB stores only the **key**; the public URL is **derived**. Storage is behind a **port**, mirroring the repository DB-swap seam.

---

## 2. Frontend architecture — `fe-architecture.png`

Feature-sliced React with the Container/Presentational split and single-responsibility hooks.

- **AvatarCardContainer** — wires the hook's values into props; renders `AvatarCard`.
- **AvatarCard (render only)** — presentational: preview, upload input, remove button, status. No logic.
- **useProfileAvatar (hook = all logic)** — validates the file, requests the upload ticket, PUTs to storage, confirms with the API, handles remove, and pushes the updated user into global state.
- **api/** layer:
  - **apiClient** — `requestAvatarUploadUrl`, `uploadAvatarToStorage` (direct `PUT` to S3), `setAvatar`, `removeAvatar`.
  - **endpoints.ts** — the `/api/me/avatar*` URL constants.
  - **parseApiResponse** — parses raw JSON into typed domain objects (`parseUser`, `parseAvatarUploadTicket`).
- **global state**:
  - **Redux auth slice** — holds `currentUser.avatarUrl`, the single source of truth for the logged-in user.
  - **useAuth().updateCurrentUser** — how a successful upload/remove updates the store and re-renders every surface.
- **shared/components/UserAvatar**:
  - **UserAvatarContainer** — computes initials (`deriveInitials`) and picks image-vs-fallback.
  - **UserAvatar** — renders the `<img>` or an initials circle.
- **display surfaces** — **ChatTopbar**, **SidebarUserChip**, and **MessageList senders map** all consume `UserAvatar`.
- **NestJS API / AWS S3 / CloudFront CDN** — externals. The API returns the URL; the browser loads the actual image bytes from the CDN via `img src`.

Key idea: one shared `UserAvatar` everywhere, one hook owning all upload logic, and the store as the single source of truth so every surface updates at once.

---

## 3. Full end-to-end flow — `full-flow.png`

A sequence diagram across **User → Browser (AvatarCard/useProfileAvatar) → NestJS API → S3 → MongoDB → CloudFront**, in three phases.

**UPLOAD (purple)** — the two-phase secure upload:
1–2. User picks a file; the browser validates type and size (UX gate).
3–5. `POST /api/me/avatar/upload-url`; the API builds the key `avatars/<userId>/<uuid>.<ext>` and returns a 5-minute presigned `PUT` URL.
6–7. The browser uploads the **file bytes straight to S3** — never through the API.
8–9. `PUT /api/me/avatar {key}`; the server re-validates ownership, existence, size, and type (the real trust gate).
10–11. Persists `avatarKey` (reading the previous key first) and deletes the old object if this was a replacement.
12–13. Returns the `PublicUser` with the resolved CDN URL; the browser updates the Redux store.

**READ (blue)** — how images are served at scale:
14–16. Every surface loads the image from **CloudFront**; on a cache miss the CDN fetches from the private bucket via **Origin Access Control**, then caches at the edge. Reads never hit the API or S3 directly.

**REMOVE (red)**:
17–21. `DELETE /api/me/avatar` clears `avatarKey`, deletes the S3 object, and returns `avatarUrl: null`, so the UI falls back to the initials placeholder.

Key idea: presigned URLs keep credentials on the server, the confirm step enforces validity, and the CDN makes reads cheap and fast.
