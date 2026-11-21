# Task 06: Implement Movies API with Validation and OpenAPI Docs

## Goal
Implement the Movies REST API endpoints under `/api/movies` with robust input validation, transactional persistence in PostgreSQL, graph cycle protection via `wouldCreateCycle` (returning `409 CIRCULAR_DEPENDENCY`), rewatch order calculation via `calculateRewatchOrder`, and complete OpenAPI 3.0 path definitions in `backend/src/docs/openapi.yaml`.

## Scope
- In:
  - Input validation helper/middleware in `backend/src/validators/movieValidator.ts`.
  - Database service in `backend/src/services/movieService.ts` (CRUD, graph builder for cycle detection and rewatch ordering, transaction management).
  - Controller and Express router in `backend/src/routes/movies.ts` mounted at `/api/movies`.
  - Wire `/api/movies` router in `backend/src/app.ts`.
  - Update `backend/src/docs/openapi.yaml` with all movie paths, parameters, schemas, and examples.
  - Integration test suite in `backend/tests/integration/movies.test.ts`.
- Out:
  - Cinema and booking quote endpoints (reserved for Task 7).
  - Frontend views (reserved for Tasks 8, 9, 10).

## Files (created/changed)
- `docs/specs/06-movies-api.md` (this spec)
- `backend/src/validators/movieValidator.ts`
- `backend/src/services/movieService.ts`
- `backend/src/routes/movies.ts`
- `backend/src/app.ts`
- `backend/src/docs/openapi.yaml`
- `backend/tests/integration/movies.test.ts`
- `backend/tests/integration/docs.test.ts`
- `docs/TASKS.md`
- `docs/AI_USAGE.md`

## Behavior
### 1. `POST /api/movies`
- **Body**: `{ title: string, releaseYear: number, runtime: number, watched?: boolean, prerequisites?: number[] }`
- **Success**: `201 Created` with full `Movie` object.
- **Errors**:
  - `400 VALIDATION_ERROR`: title missing/blank, releaseYear not 1888-2100, runtime not 1-300, duplicate prerequisite IDs.
  - `400 INVALID_PREREQUISITE`: one or more prerequisite IDs do not exist in DB.
  - `409 DUPLICATE_TITLE`: title already exists (case-insensitive).
  - `409 CIRCULAR_DEPENDENCY`: self-dependency or cycle introduced.

### 2. `GET /api/movies`
- **Success**: `200 OK` returning `Movie[]` sorted by ID ascending.

### 3. `PATCH /api/movies/:id`
- **URL Param**: `id` (integer). If not found -> `404 NOT_FOUND`.
- **Body**: partial `{ title?: string, releaseYear?: number, runtime?: number, watched?: boolean, prerequisites?: number[] }`.
- **Prerequisites Replacement**: If `prerequisites` is provided, replaces all existing prerequisites for the movie in a transaction.
- **Errors**:
  - `400 VALIDATION_ERROR`: invalid fields or duplicate IDs.
  - `400 INVALID_PREREQUISITE`: unknown prerequisite ID.
  - `404 NOT_FOUND`: movie does not exist.
  - `409 DUPLICATE_TITLE`: new title conflicts with another movie.
  - `409 CIRCULAR_DEPENDENCY`: prerequisite replacement introduces a cycle.
- **Success**: `200 OK` with updated `Movie` object.

### 4. `GET /api/movies/:id/rewatch-order`
- **URL Param**: `id` (integer). If not found -> `404 NOT_FOUND`.
- **Success**: `200 OK` with `{ target: { id, title }, order: Movie[], total: number, watchedCount: number, remainingRuntime: number }`.

## Test Cases (written first)
| Endpoint | Scenario | Expected Status | Expected Error / Body |
|---|---|---|---|
| `POST /api/movies` | Valid movie without prereqs | 201 | Created movie object with `prerequisites: []` |
| `POST /api/movies` | Missing title or invalid runtime | 400 | `{ error: { code: 'VALIDATION_ERROR' } }` |
| `POST /api/movies` | Duplicate title (case-insensitive) | 409 | `{ error: { code: 'DUPLICATE_TITLE' } }` |
| `POST /api/movies` | Nonexistent prerequisite id | 400 | `{ error: { code: 'INVALID_PREREQUISITE' } }` |
| `PATCH /api/movies/:id` | Update watched status to true | 200 | Updated movie with `watched: true` |
| `PATCH /api/movies/:id` | Cyclic prerequisite (e.g. Endgame -> Iron Man) | 409 | `{ error: { code: 'CIRCULAR_DEPENDENCY' } }` |
| `PATCH /api/movies/:id` | Nonexistent movie ID | 404 | `{ error: { code: 'NOT_FOUND' } }` |
| `GET /api/movies/:id/rewatch-order` | Target Doomsday with MCU prerequisite chain | 200 | All 7 movies in topological order, correct `watchedCount` & `remainingRuntime` |
| `GET /api/movies/:id/rewatch-order` | Target with no prerequisites (Ragnarok) | 200 | `order: []`, `total: 0`, `watchedCount: 0`, `remainingRuntime: 0` |
| `GET /api/movies/:id/rewatch-order` | Nonexistent movie ID | 404 | `{ error: { code: 'NOT_FOUND' } }` |

## Acceptance Criteria
- [x] All 4 endpoints (`POST /movies`, `GET /movies`, `PATCH /movies/:id`, `GET /movies/:id/rewatch-order`) implemented.
- [x] Input validations enforce schema rules and return standard error format `{ error: { code, message } }`.
- [x] Circular dependencies return `409 CIRCULAR_DEPENDENCY`.
- [x] `backend/src/docs/openapi.yaml` includes full documentation and examples for all movie endpoints.
- [x] Integration tests pass via `pnpm test`.
- [x] Typecheck passes with 0 errors (`pnpm tsc --noEmit`).
- [x] Clean commit created with exact message: `feat(backend): implement movies API with validation and OpenAPI docs`.
