import { BookingCalculationResult, BundleCount } from './types.js';

/**
 * Coin-Change Booking Algorithm (Unbounded Knapsack / Exact Minimum Bundles)
 *
 * Approach:
 * Solves the minimum seat bundle problem for a group size using Dynamic Programming.
 *
 * 1. State:
 *    - `dp[i]`: minimum count of bundles whose sizes sum exactly to `i`.
 *    - Base case: `dp[0] = 0`; all other `dp[i]` initialized to `Infinity`.
 *    - `choice[i]`: the bundle size chosen that resulted in the optimal `dp[i]`.
 *
 * 2. Transition:
 *    For target seat sum `i` from 1 to `groupSize`:
 *      For each bundle `size` in `bundleSizes`:
 *        If `i >= size` and `dp[i - size] + 1 < dp[i]`:
 *          `dp[i] = dp[i - size] + 1`
 *          `choice[i] = size`
 *
 * 3. Reconstruction:
 *    - If `dp[groupSize] === Infinity`: return `{ possible: false }` immediately (impossible combination).
 *    - Backtrack from `groupSize` using `choice` to collect all bundle sizes used.
 *    - Tally quantities into a frequency map, convert to `{ size, count }[]`, and sort
 *      descending by `size` per Decision #9.
 *
 * Pure function: No database, HTTP, or external library dependencies.
 */
export function calculateOptimalBundles(
  groupSize: number,
  bundleSizes: number[]
): BookingCalculationResult {
  if (groupSize <= 0 || bundleSizes.length === 0) {
    return { possible: false };
  }

  // Use Float64Array or 32-bit typed arrays for maximum cache locality and speed
  const dp = new Uint32Array(groupSize + 1);
  const choice = new Uint16Array(groupSize + 1);

  // Initialize with max value sentinel (0xFFFFFFFF)
  dp.fill(0xFFFFFFFF);
  dp[0] = 0;

  // Sort bundle sizes ascending to optimize branch evaluation
  const sortedSizes = [...new Set(bundleSizes)].sort((a, b) => a - b);

  for (let i = 1; i <= groupSize; i++) {
    for (let j = 0; j < sortedSizes.length; j++) {
      const size = sortedSizes[j];
      if (size > i) {
        break; // Since sortedSizes is ascending, larger sizes cannot fit
      }

      const prev = dp[i - size];
      if (prev !== 0xFFFFFFFF && prev + 1 < dp[i]) {
        dp[i] = prev + 1;
        choice[i] = size;
      }
    }
  }

  // If groupSize is unreachable, return impossible immediately
  if (dp[groupSize] === 0xFFFFFFFF) {
    return { possible: false };
  }

  // Reconstruct chosen bundles
  const countsMap = new Map<number, number>();
  let current = groupSize;

  while (current > 0) {
    const size = choice[current];
    countsMap.set(size, (countsMap.get(size) || 0) + 1);
    current -= size;
  }

  // Convert to BundleCount array sorted by size descending
  const bundles: BundleCount[] = Array.from(countsMap.entries())
    .map(([size, count]) => ({ size, count }))
    .sort((a, b) => b.size - a.size);

  return {
    possible: true,
    totalBundles: dp[groupSize],
    bundles,
  };
}
