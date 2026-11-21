import { describe, it, expect } from 'vitest';
import { calculateOptimalBundles } from '../../src/algorithms/booking.js';

describe('Coin-Change Booking Algorithm (calculateOptimalBundles)', () => {
  it('Greedy failure case: [1, 3, 4] with groupSize 6 -> 2 bundles (3 x 2), not greedy 4 + 1 + 1 (3 bundles)', () => {
    const result = calculateOptimalBundles(6, [1, 3, 4]);

    expect(result.possible).toBe(true);
    if (result.possible) {
      expect(result.totalBundles).toBe(2);
      expect(result.bundles).toEqual([{ size: 3, count: 2 }]);

      // Verify exact sum
      const sum = result.bundles.reduce((acc, b) => acc + b.size * b.count, 0);
      expect(sum).toBe(6);
    }
  });

  it('SPEC acceptance: [2, 5] with groupSize 11 -> 4 bundles: 5 x 1, 2 x 3', () => {
    const result = calculateOptimalBundles(11, [2, 5]);

    expect(result.possible).toBe(true);
    if (result.possible) {
      expect(result.totalBundles).toBe(4);
      expect(result.bundles).toEqual([
        { size: 5, count: 1 },
        { size: 2, count: 3 },
      ]);

      const sum = result.bundles.reduce((acc, b) => acc + b.size * b.count, 0);
      expect(sum).toBe(11);
    }
  });

  it('SPEC acceptance: [6, 9, 20] with groupSize 44 -> 4 bundles: 20 x 1, 9 x 2, 6 x 1', () => {
    const result = calculateOptimalBundles(44, [6, 9, 20]);

    expect(result.possible).toBe(true);
    if (result.possible) {
      expect(result.totalBundles).toBe(4);
      expect(result.bundles).toEqual([
        { size: 20, count: 1 },
        { size: 9, count: 2 },
        { size: 6, count: 1 },
      ]);

      const sum = result.bundles.reduce((acc, b) => acc + b.size * b.count, 0);
      expect(sum).toBe(44);
    }
  });

  it('SPEC acceptance: [4, 6] with groupSize 7 -> possible: false', () => {
    const result = calculateOptimalBundles(7, [4, 6]);
    expect(result.possible).toBe(false);
  });

  it('Group size smaller than smallest bundle -> possible: false', () => {
    const result = calculateOptimalBundles(1, [2, 5]);
    expect(result.possible).toBe(false);
  });

  it('Exact match with a single bundle', () => {
    const result = calculateOptimalBundles(20, [5, 10, 20]);

    expect(result.possible).toBe(true);
    if (result.possible) {
      expect(result.totalBundles).toBe(1);
      expect(result.bundles).toEqual([{ size: 20, count: 1 }]);
    }
  });

  it('Bundle containing size 1 is always possible for any positive groupSize', () => {
    const result = calculateOptimalBundles(37, [1, 5, 10]);

    expect(result.possible).toBe(true);
    if (result.possible) {
      const sum = result.bundles.reduce((acc, b) => acc + b.size * b.count, 0);
      expect(sum).toBe(37);
      expect(result.totalBundles).toBe(6); // 10x3 + 5x1 + 1x2 = 6 bundles
    }
  });

  it('Reconstructs bundles sorted by size descending', () => {
    const result = calculateOptimalBundles(16, [2, 5, 10]);

    expect(result.possible).toBe(true);
    if (result.possible) {
      for (let i = 0; i < result.bundles.length - 1; i++) {
        expect(result.bundles[i].size).toBeGreaterThan(result.bundles[i + 1].size);
      }
    }
  });

  it('Performance stress test: groupSize 10,000 with 10 bundle sizes finishes < 100ms', () => {
    const bundleSizes = [2, 3, 7, 11, 13, 17, 19, 23, 29, 31];
    const groupSize = 10000;

    const start = performance.now();
    const result = calculateOptimalBundles(groupSize, bundleSizes);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
    expect(result.possible).toBe(true);
    if (result.possible) {
      const sum = result.bundles.reduce((acc, b) => acc + b.size * b.count, 0);
      expect(sum).toBe(10000);
      const totalCount = result.bundles.reduce((acc, b) => acc + b.count, 0);
      expect(result.totalBundles).toBe(totalCount);
    }
  });
});
