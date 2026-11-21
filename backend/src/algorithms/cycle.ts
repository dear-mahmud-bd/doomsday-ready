/**
 * Cycle Detection Algorithm
 *
 * Approach:
 * Checks whether assigning a set of prerequisite movie IDs to a target movie would
 * introduce a circular dependency (directed cycle) in the prerequisite graph.
 *
 * 1. Immediate self-dependency check:
 *    If `movieId` appears in `newPrereqIds`, a movie directly depends on itself (cycle of length 1).
 * 2. Reachability check (DFS traversal):
 *    Starting from each proposed prerequisite in `newPrereqIds`, we traverse outgoing
 *    prerequisite edges using `getPrerequisites`. If any path reaches `movieId`, then
 *    adding the new edge `movieId -> prereq` completes a cycle `movieId -> prereq -> ... -> movieId`.
 * 3. A `visited` set prevents redundant traversal and terminates safely even on cyclic inputs.
 *
 * Pure function: No database, HTTP, or external library dependencies.
 */
export function wouldCreateCycle(
  movieId: number,
  newPrereqIds: number[],
  getPrerequisites: (id: number) => number[] | Iterable<number>
): boolean {
  // 1. Direct self-dependency
  for (const prereqId of newPrereqIds) {
    if (prereqId === movieId) {
      return true;
    }
  }

  // 2. DFS traversal to check if movieId is reachable from any new prerequisite
  const visited = new Set<number>();
  const stack: number[] = [...newPrereqIds];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === movieId) {
      return true;
    }

    if (!visited.has(current)) {
      visited.add(current);
      const prerequisites = getPrerequisites(current);
      for (const nextPrereq of prerequisites) {
        if (nextPrereq === movieId) {
          return true;
        }
        if (!visited.has(nextPrereq)) {
          stack.push(nextPrereq);
        }
      }
    }
  }

  return false;
}
