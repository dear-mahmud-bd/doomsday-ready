# Task 07: Implement Cinemas and Booking Quote Endpoints

## Goal
Implement the Cinemas REST API and seat booking quote calculation endpoints under `/api/cinemas` with input validation, transactional persistence in PostgreSQL, dynamic programming bundle calculation via `calculateOptimalBundles`, and complete OpenAPI 3.0 path documentation in `backend/src/docs/openapi.yaml`.

## Scope
- In:
  - Input validator in `backend/src/validators/cinemaValidator.ts` (cinema creation rules, `groupSize` 1..10,000 validation).
  - Repository interface and implementations in `backend/src/repositories/cinemaRepository.ts` (`PgCinemaRepository`, `InMemoryCinemaRepository`).
  - Business logic service in `backend/src/services/cinemaService.ts` integrating pure DP booking algorithm.
  - Express router in `backend/src/routes/cinemas.ts` mounted at `/api/cinemas` in `backend/src/app.ts`.
  - Update `backend/src/docs/openapi.yaml` with `/cinemas` and `/cinemas/{id}/booking` paths, parameters, schemas, and SPEC examples.
  - Integration test suite in `backend/tests/integration/cinemas.test.ts`.
  - Update OpenAPI drift test in `backend/tests/integration/docs.test.ts`.
- Out:
  - Frontend cinema and booking views (reserved for Tasks 8, 9, 10).
  - Seat reservations or payment processing (quotes only per Decision #2).

## Files (created/changed)
- `docs/specs/07-cinemas-booking-api.md` (this spec)
- `backend/src/validators/cinemaValidator.ts`
- `backend/src/repositories/cinemaRepository.ts`
- `backend/src/services/cinemaService.ts`
- `backend/src/routes/cinemas.ts`
- `backend/src/app.ts`
- `backend/src/docs/openapi.yaml`
- `backend/tests/integration/cinemas.test.ts`
- `backend/tests/integration/docs.test.ts`
- `docs/TASKS.md`
- `docs/AI_USAGE.md`

## Behavior
### 1. `POST /api/cinemas`
- **Body**: `{ name: string, bundleSizes: number[] }`
- **Validation**:
  - `name`: required non-empty string. Duplicate name (case-insensitive) -> `409 DUPLICATE_NAME`.
  - `bundleSizes`: array of 1 to 10 distinct integers, each between 1 and 500. Duplicates or invalid range -> `400 VALIDATION_ERROR`.
- **Success**: `201 Created` with `{ id: number, name: string, bundleSizes: number[] }` sorted ascending.

### 2. `GET /api/cinemas`
- **Success**: `200 OK` returning `Cinema[]` sorted by ID ascending.

### 3. `GET /api/cinemas/:id/booking?groupSize=X`
- **URL Params / Query**:
  - `id`: integer. If cinema not found -> `404 NOT_FOUND`.
  - `groupSize`: integer between 1 and 10000. Missing, non-integer, or outside 1..10000 -> `400 VALIDATION_ERROR`.
- **Success (Possible)**:
  `200 OK`
  ```json
  {
    "cinema": { "id": 1, "name": "Stark Odeon" },
    "groupSize": 11,
    "possible": true,
    "totalBundles": 4,
    "bundles": [
      { "size": 5, "count": 1 },
      { "size": 2, "count": 3 }
    ]
  }
  ```
- **Success (Impossible)**:
  `200 OK`
  ```json
  {
    "cinema": { "id": 1, "name": "Stark Odeon" },
    "groupSize": 7,
    "possible": false
  }
  ```

## Test Cases (written first)
| Endpoint | Scenario | Expected Status | Expected Error / Body |
|---|---|---|---|
| `POST /api/cinemas` | Valid cinema `{ name: 'Stark Odeon', bundleSizes: [2, 5] }` | 201 | Created cinema object with sorted `bundleSizes: [2, 5]` |
| `POST /api/cinemas` | Duplicate cinema name (case-insensitive) | 409 | `{ error: { code: 'DUPLICATE_NAME' } }` |
| `POST /api/cinemas` | Duplicate bundle sizes `[2, 2, 5]` | 400 | `{ error: { code: 'VALIDATION_ERROR' } }` |
| `POST /api/cinemas` | More than 10 bundle sizes or size > 500 | 400 | `{ error: { code: 'VALIDATION_ERROR' } }` |
| `GET /api/cinemas` | Fetch all cinemas | 200 | Array of cinemas |
| `GET /api/cinemas/:id/booking?groupSize=11` | Cinema with bundles `[2, 5]`, group 11 | 200 | `possible: true`, `totalBundles: 4`, `bundles: [{size: 5, count: 1}, {size: 2, count: 3}]` |
| `GET /api/cinemas/:id/booking?groupSize=7` | Cinema with bundles `[4, 6]`, group 7 | 200 | `possible: false` |
| `GET /api/cinemas/:id/booking?groupSize=0` | Invalid groupSize (out of range) | 400 | `{ error: { code: 'VALIDATION_ERROR' } }` |
| `GET /api/cinemas/:id/booking` | Missing groupSize query parameter | 400 | `{ error: { code: 'VALIDATION_ERROR' } }` |
| `GET /api/cinemas/999/booking?groupSize=10` | Nonexistent cinema ID | 404 | `{ error: { code: 'NOT_FOUND' } }` |

## Acceptance Criteria
- [x] All 3 endpoints (`POST /cinemas`, `GET /cinemas`, `GET /cinemas/:id/booking`) implemented and mounted.
- [x] Input validations enforce 1-10 bundle sizes (1-500) and group sizes (1-10000).
- [x] Duplicate cinema names return `409 DUPLICATE_NAME`.
- [x] Booking returns accurate DP minimum bundle count and breakdown or `{ possible: false }`.
- [x] `backend/src/docs/openapi.yaml` updated with `/cinemas` and `/cinemas/{id}/booking`.
- [x] Integration tests and OpenAPI drift test pass via `pnpm test`.
- [x] Typecheck passes with 0 errors (`pnpm tsc --noEmit`).
- [x] Clean commit created with exact message: `feat(backend): implement cinemas and booking quote endpoints`.
