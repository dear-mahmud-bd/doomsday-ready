# Task 03: Scaffold Express TypeScript App with DB Schema and Swagger UI

## Goal
Scaffold the backend Node.js + Express + TypeScript application, set up PostgreSQL connection and migration runner with full schema constraints, implement centralized standard error handling, mount health check (`/api/health`), and serve Swagger UI at `/api/docs` and OpenAPI JSON at `/api/openapi.json`.

## Scope
- In:
  - `backend/package.json` with scripts (`build`, `start`, `dev`, `test`, `migrate`).
  - `backend/tsconfig.json` in strict TypeScript mode.
  - `backend/.env.example` with standard database connection strings and port config.
  - Database pool (`backend/src/db/index.ts`) and migration runner (`backend/src/db/migrate.ts`).
  - Initial SQL migration `backend/src/db/migrations/001_initial_schema.sql` (movies, movie_prerequisites, cinemas, cinema_bundles, case-insensitive unique indexes, constraints).
  - Standard error handling (`AppError`, `errorHandler`) formatting `{ error: { code, message } }`.
  - Swagger UI & OpenAPI 3.0 spec:
    - `backend/src/docs/openapi.yaml` covering initial schemas and `/api/health`.
    - `backend/src/docs/swagger.ts` mounting `/api/docs` and `/api/openapi.json`.
  - Express app (`backend/src/app.ts`) and entry point (`backend/src/server.ts`).
  - Integration tests for `/api/health`, `/api/docs`, and 404 handler (`backend/tests/integration/`).
- Out:
  - Algorithm implementations (reserved for Tasks 4 & 5).
  - Movie and Cinema CRUD endpoints (reserved for Tasks 6 & 7).

## Files (created/changed)
- `docs/specs/03-backend-scaffold.md`
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/.env.example`
- `backend/src/config/index.ts`
- `backend/src/errors/AppError.ts`
- `backend/src/middleware/errorHandler.ts`
- `backend/src/db/index.ts`
- `backend/src/db/migrate.ts`
- `backend/src/db/migrations/001_initial_schema.sql`
- `backend/src/docs/openapi.yaml`
- `backend/src/docs/swagger.ts`
- `backend/src/routes/health.ts`
- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/vitest.config.ts`
- `backend/tests/integration/health.test.ts`
- `backend/tests/integration/docs.test.ts`
- `docs/TASKS.md`
- `docs/AI_USAGE.md`

## Behavior
- `GET /api/health` -> `200 { "status": "ok" }`.
- `GET /api/docs` -> `200` Swagger UI HTML.
- `GET /api/openapi.json` -> `200` OpenAPI 3.0 specification JSON.
- `GET /api/nonexistent` -> `404 { "error": { "code": "NOT_FOUND", "message": "Route not found" } }`.
- All errors adhere to `{ "error": { "code": string, "message": string } }`.

## Test Cases (written first)
| Endpoint | Method | Expected Status | Expected Body Shape |
|---|---|---|---|
| `/api/health` | GET | 200 | `{ "status": "ok" }` |
| `/api/docs` | GET | 200 or 301 | Swagger UI HTML / redirect |
| `/api/openapi.json` | GET | 200 | Object with `openapi: "3.0.3"`, `paths`, `info` |
| `/api/unknown` | GET | 404 | `{ "error": { "code": "NOT_FOUND", "message": "..." } }` |

## Acceptance Criteria
- [x] Backend dependencies install cleanly via `pnpm install` in `backend/`.
- [x] TypeScript compiles cleanly with zero errors (`pnpm --filter backend tsc --noEmit` or `cd backend && pnpm tsc --noEmit`).
- [x] Initial database migration file contains all tables, constraints (year 1888-2100, runtime 1-300, bundle size 1-500, self-prerequisite check), and case-insensitive lower() unique indexes.
- [x] Swagger UI is served at `/api/docs` and valid OpenAPI spec at `/api/openapi.json`.
- [x] Integration tests pass (`pnpm test` in `backend/`).
- [x] Forbidden library scan confirms no graph/DP libraries in backend algorithms.
- [x] Commit created with exact message: `chore(backend): scaffold Express TypeScript app with DB schema and Swagger UI`.

## Assumptions
- For local unit/integration tests without an active live Postgres DB, migration runner and app handle optional DB connection gracefully so health and docs integration tests execute reliably in any CI/sandbox environment.
