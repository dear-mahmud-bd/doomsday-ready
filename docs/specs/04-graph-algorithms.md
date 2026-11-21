# Task 04: Add Cycle Detection and Rewatch-Order Algorithms

## Goal
Implement pure graph algorithms from scratch in `backend/src/algorithms/` with **zero** external libraries:
1. `cycle.ts`: Detect potential circular dependencies before saving prerequisites (`wouldCreateCycle`).
2. `rewatchOrder.ts`: Compute topological rewatch order for a target movie using post-order DFS, along with `total`, `watchedCount`, and `remainingRuntime` calculations.

## Scope
- In:
  - Types in `backend/src/algorithms/types.ts` (`MovieNode`, `RewatchPlanResult`).
  - Pure function `wouldCreateCycle(movieId: number, newPrereqIds: number[], getPrerequisites: (id: number) => number[] | Iterable<number>): boolean` in `backend/src/algorithms/cycle.ts`.
  - Pure function `calculateRewatchOrder(targetId: number, movies: Map<number, MovieNode>): RewatchPlanResult` in `backend/src/algorithms/rewatchOrder.ts`.
  - Comprehensive unit test suite in `backend/tests/unit/cycle.test.ts` and `backend/tests/unit/rewatchOrder.test.ts` following `algorithm-tdd`.
- Out:
  - Express routes, database queries, and HTTP controllers (reserved for Task 6).
  - Coin-change booking algorithm (reserved for Task 5).

## Files (created/changed)
- `docs/specs/04-graph-algorithms.md` (this spec)
- `backend/src/algorithms/types.ts`
- `backend/src/algorithms/cycle.ts`
- `backend/src/algorithms/rewatchOrder.ts`
- `backend/tests/unit/cycle.test.ts`
- `backend/tests/unit/rewatchOrder.test.ts`
- `docs/TASKS.md`
- `docs/AI_USAGE.md`

## Behavior
### 1. Cycle Detection (`wouldCreateCycle`)
- Checks if setting `newPrereqIds` for `movieId` introduces a direct or transitive cycle:
  - Immediate self-loop: `newPrereqIds.includes(movieId)` -> returns `true`.
  - Reachability: DFS/BFS traverses prerequisites starting from each `prereqId` in `newPrereqIds`. If any path reaches `movieId`, returns `true`.
  - Otherwise returns `false`.

### 2. Rewatch Order (`calculateRewatchOrder`)
- Collects all transitive prerequisites of `targetId` in topological order:
  - Post-order DFS: a movie is pushed to `order` only **after** all its prerequisites have been processed.
  - Cycle-safe & Diamond-safe: uses a `visited` set to ensure every prerequisite is visited and included exactly once.
  - Excludes the `targetId` movie itself from the `order`.
  - Deterministic tie-breaking: when expanding multiple prerequisites, iterates in sorted order (e.g. by prerequisite ID).
- Computes summary metrics:
  - `total`: number of movies in `order`.
  - `watchedCount`: number of movies in `order` where `watched === true`.
  - `remainingRuntime`: sum of `runtime` for movies in `order` where `watched === false`.

## Test Cases (written first per `algorithm-tdd`)
| Scenario | Input | Expected Output |
|---|---|---|
| Direct self-loop | `wouldCreateCycle(1, [1], ...)` | `true` |
| Direct 2-node cycle | 2 depends on 1; `wouldCreateCycle(1, [2], ...)` | `true` |
| Transitive cycle | 8 (Endgame) -> 7 -> 6 -> 4 -> 3 -> 1; `wouldCreateCycle(1, [8], ...)` | `true` |
| Valid DAG extension | 1 has no prereqs; `wouldCreateCycle(4, [3], ...)` | `false` |
| Rewatch Doomsday | 8 sample MCU movies from SPEC | 7 movies in order, each after its prereqs, target excluded |
| Rewatch Civil War | Target Civil War (4) | Iron Man (1) & First Avenger (2) before Avengers (3) |
| Rewatch Ragnarok | Target Ragnarok (5, no prereqs) | `order: []`, `total: 0`, `watchedCount: 0`, `remainingRuntime: 0` |
| Diamond graph | A -> B, C; B -> D; C -> D | D appears once before B and C |
| Watched runtime math | 7 movies (3 watched, 4 unwatched) | `watchedCount: 3`, `remainingRuntime` matches sum of unwatched runtimes |

## Acceptance Criteria
- [x] No external graph or topological sort libraries used (`git grep` check passes).
- [x] Functions are 100% pure (no DB, no Express, no external side effects).
- [x] Unit tests written first and pass 100% via `pnpm test`.
- [x] All SPEC.md sample data and acceptance examples pass.
- [x] Typecheck passes with 0 errors (`pnpm tsc --noEmit`).
- [x] Clean commit created with exact message: `feat(backend): add cycle detection and rewatch-order algorithms`.

## Assumptions
- If `targetId` does not exist in `movies` map, throws `AppError` or standard `Error('Movie not found')`.
