# Week 2 — Frontend Chat MVP

React + Vite + TypeScript chat UI with MSW-mocked API. See [API_CONTRACT.md](./API_CONTRACT.md) for the Week 3 backend contract.

## Scripts

```bash
npm run dev        # dev server + MSW
npm run build      # production build
npm test           # Vitest + Testing Library
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
```

## Architecture

- `src/api/` — typed `apiClient` (single HTTP surface)
- `src/mocks/` — MSW handlers + in-memory DB
- `src/hooks/` — domain hooks (`useConversations`, `useMessages`, …)
- `src/features/` — presentational components + `*.container.tsx` wiring
- `src/context/` — auth, toasts, dev settings
