---
name: algorithm-tdd
description: Write the rewatch-order, cycle-detection and coin-change booking algorithms test-first, from scratch, as pure functions. Use for tasks 4 and 5, or any time someone touches backend/src/algorithms/, topological order, dependency cycles, bundle quotes, or coin change. Forbids graph/DP libraries.
---

# Algorithm TDD (no libraries)

Location: `backend/src/algorithms/` (`cycle.ts`, `rewatchOrder.ts`, `booking.ts`), tests in
`backend/tests/unit/`. Pure functions only. No `graphlib`, `toposort`, or any DP/graph package.

## Order of work
1. Write tests from `docs/SPEC.md` examples FIRST, watch them fail.
2. Implement until green. 3. Add edge cases. 4. Explain the approach in a short comment block.

## Rewatch order (post-order DFS)
- Input: `Map<id, {id,title,runtime,watched,prereqs:number[]}>`, `targetId`.
- DFS over prereqs with a `visited` set; push a movie AFTER its prereqs; never push the target.
- Return `{ order, total, watchedCount, remainingRuntime }` (remaining = sum runtime of unwatched).
- Prefer an iterative DFS if the graph can be deep.

## Cycle detection
- `wouldCreateCycle(movieId, newPrereqIds, graph)`: true if `movieId` is in `newPrereqIds`, or
  any new prereq can reach `movieId` by following prerequisite edges. Check BEFORE saving.

## Booking (coin change, min count, exact sum)
- `dp[0]=0`, `dp[i]=min(dp[i-s]+1)` for `s<=i`; keep `choice[i]`.
- If `dp[n]===Infinity` return `{possible:false}` BEFORE reconstructing (avoids an infinite loop).
- Greedy is WRONG ({1,3,4}, 6 -> 3+3, not 4+1+1). Add a test proving it.

## Required test cases
Rewatch: Doomsday -> 7 movies in valid order; Civil War -> {Iron Man, First Avenger} then Avengers;
Ragnarok -> []; Endgame as prereq of Iron Man -> cycle; self-dependency; diamond (no duplicates);
watchedCount/remainingRuntime math.
Booking: {1,3,4}/6 -> 2 bundles; {2,5}/11 -> 4; {6,9,20}/44 -> 4; {4,6}/7 -> not possible;
bundle containing 1 always possible; groupSize equals one bundle -> 1; {2,5}/1 -> not possible;
groupSize 10000 with 10 sizes finishes < 100 ms. Assert returned bundles sum exactly to groupSize.
Tests must verify validity (every movie after its prereqs), not one hardcoded order.
