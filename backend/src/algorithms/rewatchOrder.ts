import { MovieNode, RewatchPlanResult } from './types.js';

/**
 * Rewatch Order Algorithm (Topological Sort via Post-Order DFS)
 *
 * Approach:
 * Computes the optimal viewing order to rewatch all prerequisites for a target movie.
 *
 * 1. Post-order DFS:
 *    A movie must only be viewed AFTER all of its prerequisites have been viewed.
 *    Starting from the target movie's immediate prerequisites, we recursively (or iteratively)
 *    traverse down the prerequisite graph.
 *    We add a movie to the final viewing list only after all of its prerequisites have been visited.
 * 2. Diamond / Shared Prerequisite Handling:
 *    A `visited` set ensures every required prerequisite is included exactly once, even if
 *    multiple downstream movies depend on it.
 * 3. Target Exclusion:
 *    The target movie itself is excluded from the rewatch list (it is the final movie to watch).
 * 4. Deterministic Ordering:
 *    Child edges are sorted by ID so identical graphs always produce identical orders.
 * 5. Aggregation:
 *    Calculates total count, watchedCount (movies where watched === true), and
 *    remainingRuntime (sum of runtime for movies where watched === false).
 *
 * Pure function: No database, HTTP, or external library dependencies.
 */
export function calculateRewatchOrder(
  targetId: number,
  movies: Map<number, MovieNode>
): RewatchPlanResult {
  const targetMovie = movies.get(targetId);
  if (!targetMovie) {
    throw new Error(`Movie with id ${targetId} not found`);
  }

  const order: MovieNode[] = [];
  const visited = new Set<number>();

  function dfs(currentId: number): void {
    if (visited.has(currentId)) {
      return;
    }
    visited.add(currentId);

    const movie = movies.get(currentId);
    if (!movie) {
      return;
    }

    // Sort prerequisite IDs ascending for deterministic output
    const sortedPrereqs = [...movie.prerequisites].sort((a, b) => a - b);
    for (const prereqId of sortedPrereqs) {
      dfs(prereqId);
    }

    // Add movie to order only after all its prerequisites have been visited
    // Never include the target movie itself in the rewatch order
    if (currentId !== targetId) {
      order.push(movie);
    }
  }

  // Traverse all prerequisites of targetMovie
  const initialPrereqs = [...targetMovie.prerequisites].sort((a, b) => a - b);
  for (const prereqId of initialPrereqs) {
    dfs(prereqId);
  }

  const total = order.length;
  const watchedCount = order.filter((m) => m.watched).length;
  const remainingRuntime = order
    .filter((m) => !m.watched)
    .reduce((sum, m) => sum + m.runtime, 0);

  return {
    target: {
      id: targetMovie.id,
      title: targetMovie.title,
    },
    order,
    total,
    watchedCount,
    remainingRuntime,
  };
}
