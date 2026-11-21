# Plan & Architecture

## 1. System Overview & Monorepo Structure
The repository is split into two independent directory trees with no shared code:
- `backend/`: Node.js, Express, TypeScript (strict), PostgreSQL (`pg`), plain SQL migrations, Vitest + Supertest, Swagger UI.
- `frontend/`: Vite, React, TypeScript, Tailwind CSS, React Router, typed API client (`src/api/`).
- `docker-compose.yml`: Coordinates `db` (Postgres 16), `api` (port 3000), and `web` (port 5173).

## 2. Backend Architecture & Layers
Data flows strictly inward:
1. **HTTP Layer (`src/routes/`)**:
   - Express routers mapping paths to controllers.
   - All routes prefixed with `/api`.
   - Mounts `/api/docs` and `/api/openapi.json` using `swagger-ui-express` and `yaml`.
2. **Validation Layer (`src/validators/`)**:
   - Validates request body, query params, and route parameters.
   - Throws `AppError(400, 'VALIDATION_ERROR', ...)` or domain validation errors before database access.
3. **Service Layer (`src/services/`)**:
   - Handles transactions and database queries (`pg` pool).
   - Coordinates business logic, builds in-memory graph models for algorithms, and persists changes.
4. **Algorithm Layer (`src/algorithms/`)**:
   - **Pure functions only**: NO DB access, NO HTTP/Express imports, NO external graph or DP libraries.
   - `cycle.ts`: Graph cycle detection (`wouldCreateCycle`).
   - `rewatchOrder.ts`: Topological post-order DFS rewatch ordering + runtime / watched count calculation.
   - `booking.ts`: Dynamic programming coin-change solver for minimum exact seat bundles.
5. **Error Handling (`src/middleware/errorHandler.ts`)**:
   - Intercepts all errors and maps to `{ error: { code: string, message: string } }`.
   - Distinct codes: `VALIDATION_ERROR`, `INVALID_PREREQUISITE`, `NOT_FOUND`, `DUPLICATE_TITLE`, `DUPLICATE_NAME`, `CIRCULAR_DEPENDENCY`, `INTERNAL_SERVER_ERROR`.

## 3. Database Schema & Migration Strategy
Plain SQL migrations executed at app startup or via migration runner:
- `movies`: `id SERIAL PRIMARY KEY`, `title TEXT NOT NULL`, `release_year INT NOT NULL CHECK (release_year BETWEEN 1888 AND 2100)`, `runtime INT NOT NULL CHECK (runtime BETWEEN 1 AND 300)`, `watched BOOLEAN NOT NULL DEFAULT FALSE`.
  - Case-insensitive unique index: `CREATE UNIQUE INDEX movies_title_lower_idx ON movies (LOWER(title));`
- `movie_prerequisites`: `movie_id INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE`, `prerequisite_id INT NOT NULL REFERENCES movies(id) ON DELETE RESTRICT`, `PRIMARY KEY (movie_id, prerequisite_id)`, `CHECK (movie_id <> prerequisite_id)`.
- `cinemas`: `id SERIAL PRIMARY KEY`, `name TEXT NOT NULL`.
  - Case-insensitive unique index: `CREATE UNIQUE INDEX cinemas_name_lower_idx ON cinemas (LOWER(name));`
- `cinema_bundles`: `cinema_id INT NOT NULL REFERENCES cinemas(id) ON DELETE CASCADE`, `size INT NOT NULL CHECK (size BETWEEN 1 AND 500)`, `PRIMARY KEY (cinema_id, size)`.

## 4. Testing Strategy
- **Unit Tests (`backend/tests/unit/`)**:
  - Algorithm unit tests covering all edge cases from `docs/SPEC.md` (greedy failure, cycle rejection, self-dependency, empty prerequisites, runtime math, 10,000 group size < 100ms).
- **Integration Tests (`backend/tests/integration/`)**:
  - Supertest requests against Express app verifying status codes, error shapes, transaction rollbacks.
- **OpenAPI Drift Test**:
  - Compares registered Express endpoints against paths declared in `backend/src/docs/openapi.yaml`.

## 5. Frontend Architecture
- **Views**:
  - **Movies View**: Listing with release year, runtime, watched toggle, and modal to add/edit movie + prerequisites.
  - **Rewatch Plan View**: Dropdown target movie picker, watched progress bar (`X of Y watched`), remaining runtime calculation, sequential list.
  - **Booking View**: Cinema picker, group size input, results badge grid showing bundle quantities or clear "Not possible" notice.
- **Styling**: Tailwind CSS, mobile-first responsive layout, accessible forms, crisp status badges.
- **API Client**: Strongly typed `fetch` wrapper in `frontend/src/api/` matching backend OpenAPI contracts.
