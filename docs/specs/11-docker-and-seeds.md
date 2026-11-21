# Task 11: Add Dockerfiles, Compose Setup and Seed Data

## Goal
Provide a production-ready, one-command setup using Docker Compose. Containerize the Express backend and Vite+React frontend (with Nginx reverse proxy), configure PostgreSQL 16 with automatic healthchecks, execute migrations, and seed the database with the 8 assessment MCU movies and 4 sample cinemas.

## Scope
- In:
  - `backend/Dockerfile`: Multi-stage build compiling TypeScript and packing production assets (`dist`, `openapi.yaml`, `migrations`).
  - `backend/.dockerignore` (ignores `node_modules`, `dist`, `.env`).
  - `frontend/Dockerfile`: Multi-stage build producing static build assets served via Nginx.
  - `frontend/nginx.conf`: Nginx configuration supporting SPA client-side routing (`try_files $uri /index.html`) and proxying `/api/` requests to `http://api:4000/api/`.
  - `frontend/.dockerignore` (ignores `node_modules`, `dist`, `.env`).
  - Seed script and data in `backend/src/db/seed.ts`:
    - Inserts the 8 canonical MCU movies from SPEC with accurate prerequisite graph relationships.
    - Inserts 4 sample cinemas (`Stark Odeon [2, 5]`, `Wakanda IMAX [6, 9, 20]`, `Avengers Campus [1, 3, 4]`, `Sanctum Screening Room [4, 6]`).
    - Exposes script `"seed": "tsx src/db/seed.ts"` in `backend/package.json`.
    - Auto-seeds on startup when `SEED_DATA=true` (or when database is empty).
  - Root `docker-compose.yml`:
    - Service `db`: `postgres:16-alpine` with healthcheck (`pg_isready`).
    - Service `api`: Backend on port `4000:4000` waiting for `db` healthy.
    - Service `web`: Frontend Nginx on port `5173:80` (and `80:80`).
  - Copy seeds into backend `dist/db/seeds` during `pnpm build`.
- Out:
  - Final README diagrams and documentation (reserved for Task 12).

## Files (created/changed)
- `docs/specs/11-docker-and-seeds.md` (this spec)
- `backend/Dockerfile`
- `backend/.dockerignore`
- `backend/src/db/seed.ts`
- `backend/package.json` (add `seed` script and update `build` copy)
- `backend/src/server.ts` (run seed if `SEED_DATA === 'true'`)
- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `frontend/.dockerignore`
- `docker-compose.yml`
- `docs/TASKS.md`
- `docs/AI_USAGE.md`

## Behavior
- Running `docker compose up --build` launches PostgreSQL, Express API, and Nginx Web with zero manual intervention.
- The backend automatically applies migrations and seeds initial MCU and cinema data.
- The web container serves the React application at `http://localhost:5173` and routes `/api/*` to the backend.
- Swagger UI is immediately accessible at `http://localhost:4000/api/docs` and `http://localhost:5173/api/docs`.

## Acceptance Criteria
- [x] Backend and Frontend have clean multi-stage `Dockerfile`s and `.dockerignore` files.
- [x] Nginx config handles SPA fallback and proxies `/api/` to backend service.
- [x] Seed script accurately populates the 8 assessment MCU movies and 4 sample cinemas.
- [x] Root `docker-compose.yml` coordinates `db`, `api`, and `web` with healthcheck dependencies.
- [x] Both frontend and backend typecheck and build pass cleanly.
- [x] Clean commit created with exact message: `chore: add Dockerfiles, compose setup and seed data`.
