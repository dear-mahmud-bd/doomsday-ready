# Task 08: Scaffold Vite React App with API Client

## Goal
Scaffold the frontend single-page application using Vite, React, TypeScript, and Tailwind CSS. Implement the responsive navigation layout and a strongly-typed API client in `frontend/src/api/` configured to communicate with the backend `/api` endpoints.

## Scope
- In:
  - `frontend/package.json` with React, React Router, Tailwind CSS, Lucide icons, Vite.
  - `frontend/tsconfig.json` & `frontend/tsconfig.node.json` in strict TypeScript mode.
  - `frontend/vite.config.ts` configured with React plugin and `/api` proxy targeting `http://localhost:4000`.
  - `frontend/tailwind.config.js` and `frontend/postcss.config.js` for Tailwind CSS.
  - `frontend/index.html` with title "Doomsday Ready - MCU Rewatch & Booking".
  - Typed API client in `frontend/src/api/`:
    - `types.ts`: TypeScript interfaces for `Movie`, `RewatchPlan`, `Cinema`, `BookingQuote`, `ApiError`.
    - `client.ts`: Typed fetch wrapper handling HTTP status codes and standard `{ error: { code, message } }` payloads.
    - `movies.ts`: API functions (`getMovies`, `createMovie`, `patchMovie`, `getRewatchOrder`).
    - `cinemas.ts`: API functions (`getCinemas`, `createCinema`, `getBookingQuote`).
  - App Shell & Navigation in `frontend/src/components/Layout.tsx`:
    - Responsive sticky navbar with links to **Movies**, **Rewatch Plan**, and **Seat Booking**.
    - Mobile drawer/menu toggle for small screens.
  - Routing configuration in `frontend/src/App.tsx` with placeholder page views.
  - Validation: TypeScript check (`pnpm tsc --noEmit`) and production build (`pnpm run build`).
- Out:
  - Full interactive Movies view with prerequisites selector and watched toggle (Task 9).
  - Full Rewatch progress bar and Booking quote forms (Task 10).

## Files (created/changed)
- `docs/specs/08-frontend-scaffold.md` (this spec)
- `frontend/package.json`
- `frontend/tsconfig.json`
- `frontend/tsconfig.node.json`
- `frontend/vite.config.ts`
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/index.html`
- `frontend/src/main.tsx`
- `frontend/src/index.css`
- `frontend/src/App.tsx`
- `frontend/src/components/Layout.tsx`
- `frontend/src/pages/MoviesPage.tsx`
- `frontend/src/pages/RewatchPage.tsx`
- `frontend/src/pages/BookingPage.tsx`
- `frontend/src/api/types.ts`
- `frontend/src/api/client.ts`
- `frontend/src/api/movies.ts`
- `frontend/src/api/cinemas.ts`
- `docs/TASKS.md`
- `docs/AI_USAGE.md`

## Behavior
- Visiting `/` or `/movies` displays the Movies page placeholder within the responsive Layout shell.
- Visiting `/rewatch` displays the Rewatch Plan placeholder.
- Visiting `/booking` displays the Cinema Booking placeholder.
- Navigation links highlight the active route.
- API client functions make requests to `/api/*` and parse responses, rejecting with structured `ApiError` containing `code` and `message` on HTTP 4xx/5xx responses.

## Acceptance Criteria
- [x] Dependencies install cleanly via `pnpm install` in `frontend/`.
- [x] Tailwind CSS compiles and utilities function as expected.
- [x] Vite dev proxy is configured for `/api` $\rightarrow$ `http://localhost:4000`.
- [x] Typed API client implements all backend endpoint contracts with structured error handling.
- [x] Responsive navigation shell renders across desktop and mobile screens.
- [x] Typecheck passes with 0 errors (`cd frontend && pnpm tsc --noEmit`).
- [x] Production build succeeds (`cd frontend && pnpm run build`).
- [x] Clean commit created with exact message: `chore(frontend): scaffold Vite React app with API client`.
