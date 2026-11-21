# Task 05: Add Coin-Change Booking Algorithm

## Goal
Implement the seat bundle optimization algorithm in `backend/src/algorithms/booking.ts` using dynamic programming (unbounded knapsack / coin-change variation) with **zero** external libraries. The algorithm finds the minimum number of seat bundles that sum *exactly* to a requested group size, and reconstructs the bundle breakdown sorted by bundle size descending.

## Scope
- In:
  - Types in `backend/src/algorithms/types.ts` (`BundleCount`, `BookingCalculationResult`).
  - Pure function `calculateOptimalBundles(groupSize: number, bundleSizes: number[]): BookingCalculationResult` in `backend/src/algorithms/booking.ts`.
  - Comprehensive unit test suite in `backend/tests/unit/booking.test.ts` following `algorithm-tdd`.
- Out:
  - Cinema database queries, Express controllers, and HTTP routing (reserved for Task 7).

## Files (created/changed)
- `docs/specs/05-booking-algorithm.md` (this spec)
- `backend/src/algorithms/types.ts` (adding bundle and booking types)
- `backend/src/algorithms/booking.ts` (pure DP algorithm implementation)
- `backend/tests/unit/booking.test.ts` (unit tests covering all SPEC cases + edge cases)
- `docs/TASKS.md`
- `docs/AI_USAGE.md`

## Behavior
### 1. Algorithm Design (Dynamic Programming)
- **Input**: `groupSize: number` (1 to 10,000), `bundleSizes: number[]` (1 to 10 distinct positive integers).
- **DP State**:
  - `dp[i]` = minimum bundle count to form exact sum `i`. Initialized to `Infinity`, with base case `dp[0] = 0`.
  - `choice[i]` = the bundle size chosen to achieve `dp[i]`.
- **Transitions**:
  - For `i` from 1 to `groupSize`:
    - For each `size` in `bundleSizes`:
      - If `i >= size` and `dp[i - size] + 1 < dp[i]`:
        - `dp[i] = dp[i - size] + 1`
        - `choice[i] = size`
- **Reconstruction & Exit**:
  - If `dp[groupSize] === Infinity`: return `{ possible: false }` immediately (guarantees no infinite loop).
  - Otherwise, backtrack from `groupSize` using `choice` array to collect bundle sizes.
  - Group identical bundle sizes into `{ size, count }` objects.
  - Sort the resulting `bundles` list by `size` descending (per Decision #9).
  - Return `{ possible: true, totalBundles: dp[groupSize], bundles }`.

## Test Cases (written first per `algorithm-tdd`)
| Bundle Sizes | Group Size | Expected Output | Notes |
|---|---|---|---|
| `[1, 3, 4]` | `6` | `possible: true`, `totalBundles: 2`, `[{size: 3, count: 2}]` | Proves greedy `4+1+1` (3 bundles) fails vs DP `3+3` (2 bundles) |
| `[2, 5]` | `11` | `possible: true`, `totalBundles: 4`, `[{size: 5, count: 1}, {size: 2, count: 3}]` | SPEC acceptance example |
| `[6, 9, 20]` | `44` | `possible: true`, `totalBundles: 4`, `[{size: 20, count: 1}, {size: 9, count: 2}, {size: 6, count: 1}]` | SPEC acceptance example |
| `[4, 6]` | `7` | `possible: false` | Impossible exact sum |
| `[2, 5]` | `1` | `possible: false` | Group size smaller than minimum bundle |
| `[5, 10, 20]` | `20` | `possible: true`, `totalBundles: 1`, `[{size: 20, count: 1}]` | Exact match with single largest bundle |
| `[1, 7, 13]` | `500` | `possible: true`, exact sum equals 500 | Bundle containing 1 is always possible |
| `[2, 3, 7, 11, 13, 17, 19, 23, 29, 31]` | `10000` | `possible: true`, finishes in < 100ms | Performance stress test |

## Acceptance Criteria
- [x] No external DP or coin-change libraries used (`git grep` check passes).
- [x] Pure function without side effects or external imports.
- [x] Unit tests written first and pass 100% via `pnpm test`.
- [x] Explicit test confirming greedy choice fails where DP succeeds.
- [x] Performance benchmark passes (< 100ms for group size 10,000).
- [x] Typecheck passes with 0 errors (`pnpm tsc --noEmit`).
- [x] Clean commit created with exact message: `feat(backend): add coin-change booking algorithm`.
