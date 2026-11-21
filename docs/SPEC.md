# SPEC: Doomsday Ready (source: Blinto Talent Accelerator 2027 assessment)

## Goal
Help MCU fans plan a rewatch before Avengers: Doomsday and find the fewest exact seat bundles for an opening-night group.

## Rules
Own work; AI allowed but described in README. Features 1 and 2 logic written by hand, no libraries that solve them.
Unclear points: choose reasonably, note in README (see DECISIONS.md).

## Entities
**Movie**: `id`, `title` (unique), `releaseYear`, `runtime` (int 1-300), `prerequisites` (array of movie ids, optional), `watched` (bool, default false).
**Cinema**: `id`, `name` (unique), `bundleSizes` (1-10 distinct ints, each 1-500).

## Feature 1: Movies and rewatch order
- A movie can never depend on itself, directly or transitively. Any create/update causing this => `409 CIRCULAR_DEPENDENCY`.
- Rewatch order for a target: every direct+indirect prerequisite exactly once, each after its own prerequisites, target excluded.
  Also `watchedCount` and `remainingRuntime` (sum of runtime of unwatched ones in the list).

### Sample data (not an official watch guide)
| Movie | Watch these first |
|---|---|
| Iron Man | none |
| Captain America: The First Avenger | none |
| The Avengers | Iron Man, The First Avenger |
| Captain America: Civil War | The Avengers |
| Thor: Ragnarok | none |
| Avengers: Infinity War | Civil War, Ragnarok |
| Avengers: Endgame | Infinity War |
| Avengers: Doomsday | Endgame |

### Acceptance examples
| Request | Expected |
|---|---|
| Rewatch Doomsday | other 7 movies, any valid order, e.g. Iron Man, First Avenger, Avengers, Civil War, Ragnarok, Infinity War, Endgame |
| Rewatch Civil War | Iron Man and First Avenger (either order), then The Avengers |
| Rewatch Thor: Ragnarok | empty list |
| Make Endgame a prerequisite of Iron Man | 409 CIRCULAR_DEPENDENCY |

## Feature 2: Cinemas and booking
Seats are sold only in the cinema's bundle sizes, unlimited quantity of each. For groupSize 1-10000 return the FEWEST bundles
whose seats sum EXACTLY to groupSize, with the count per size; if impossible say so.

| Bundles | Group | Expected |
|---|---|---|
| 1, 3, 4 | 6 | 2 bundles: 3 x 2 |
| 2, 5 | 11 | 4 bundles: 5 x 1, 2 x 3 |
| 6, 9, 20 | 44 | 4 bundles: 20 x 1, 9 x 2, 6 x 1 |
| 4, 6 | 7 | Not possible |

## Feature 3: Frontend (React, uses the API)
1. Movies: add movies, edit prerequisites, tick watched.
2. Rewatch Plan: pick target; ordered list with watched ticks, progress bar ("4 of 7 watched"), remaining watch time.
3. Booking: pick cinema, enter group size, show bundles to buy or "not possible".

## API (all under /api; extras allowed)
| Method | Path | Success | Errors |
|---|---|---|---|
| POST | /movies | 201 Movie | 400 VALIDATION_ERROR, 400 INVALID_PREREQUISITE, 409 DUPLICATE_TITLE, 409 CIRCULAR_DEPENDENCY |
| GET | /movies | 200 Movie[] | |
| PATCH | /movies/:id | 200 Movie | 400, 404 NOT_FOUND, 409 DUPLICATE_TITLE, 409 CIRCULAR_DEPENDENCY |
| GET | /movies/:id/rewatch-order | 200 | 404 NOT_FOUND |
| POST | /cinemas | 201 Cinema | 400 VALIDATION_ERROR, 409 DUPLICATE_NAME |
| GET | /cinemas | 200 Cinema[] | |
| GET | /cinemas/:id/booking?groupSize=6 | 200 | 400 VALIDATION_ERROR, 404 NOT_FOUND |
| GET | /health | 200 `{status:"ok"}` | |
| GET | /docs, /openapi.json | Swagger UI / raw spec | |

### Shapes
Error: `{ "error": { "code": "CIRCULAR_DEPENDENCY", "message": "..." } }`
Rewatch: `{ "target": {"id":1,"title":"..."}, "order": [Movie...], "total": 7, "watchedCount": 4, "remainingRuntime": 390 }`
Booking possible: `{ "cinema": {"id":1,"name":"..."}, "groupSize": 11, "possible": true, "totalBundles": 4, "bundles": [{"size":5,"count":1},{"size":2,"count":3}] }`
Booking impossible: `{ "cinema": {...}, "groupSize": 7, "possible": false }`

## Documentation requirement
Backend exposes Swagger UI at `/api/docs`, generated from `backend/src/docs/openapi.yaml`.

## Bonus
Data model diagram (Mermaid) in README; Docker Compose to start everything with one command.

## Submission
Git repository link via the Google Form.
