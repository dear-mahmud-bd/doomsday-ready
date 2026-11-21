import { describe, it, expect } from 'vitest';
import { wouldCreateCycle } from '../../src/algorithms/cycle.js';

describe('Cycle Detection Algorithm (wouldCreateCycle)', () => {
  it('should detect direct self-dependency (A depends on A)', () => {
    const getPrereqs = (_id: number) => [];
    expect(wouldCreateCycle(1, [1], getPrereqs)).toBe(true);
  });

  it('should detect direct 2-node cycle (1 depends on 2, trying to make 2 depend on 1)', () => {
    // 1 depends on 2
    const graph: Record<number, number[]> = {
      1: [2],
      2: [],
    };
    const getPrereqs = (id: number) => graph[id] || [];

    // Adding 1 as prerequisite for 2 creates cycle: 2 -> 1 -> 2
    expect(wouldCreateCycle(2, [1], getPrereqs)).toBe(true);
  });

  it('should detect transitive cycle (SPEC example: Endgame as prerequisite of Iron Man)', () => {
    // Current sample MCU prerequisite chain:
    // 1 (Iron Man) <- 3 (The Avengers)
    // 2 (First Avenger) <- 3 (The Avengers)
    // 3 (Avengers) <- 4 (Civil War)
    // 5 (Ragnarok)
    // 4 (Civil War) & 5 (Ragnarok) <- 6 (Infinity War)
    // 6 (Infinity War) <- 7 (Endgame)
    // 7 (Endgame) <- 8 (Doomsday)
    const graph: Record<number, number[]> = {
      1: [],
      2: [],
      3: [1, 2],
      4: [3],
      5: [],
      6: [4, 5],
      7: [6],
      8: [7],
    };
    const getPrereqs = (id: number) => graph[id] || [];

    // Making Endgame (7) a prerequisite of Iron Man (1) creates 1 -> 7 -> 6 -> 4 -> 3 -> 1
    expect(wouldCreateCycle(1, [7], getPrereqs)).toBe(true);

    // Also making Doomsday (8) a prerequisite of Iron Man (1)
    expect(wouldCreateCycle(1, [8], getPrereqs)).toBe(true);

    // Also making Infinity War (6) a prerequisite of The Avengers (3)
    expect(wouldCreateCycle(3, [6], getPrereqs)).toBe(true);
  });

  it('should return false for valid DAG extensions', () => {
    const graph: Record<number, number[]> = {
      1: [],
      2: [],
      3: [1, 2],
      4: [3],
    };
    const getPrereqs = (id: number) => graph[id] || [];

    // Adding valid prerequisites to movie 5
    expect(wouldCreateCycle(5, [1, 2, 4], getPrereqs)).toBe(false);

    // Replacing movie 4's prerequisites with [1] instead of [3]
    expect(wouldCreateCycle(4, [1], getPrereqs)).toBe(false);

    // Empty prerequisites
    expect(wouldCreateCycle(1, [], getPrereqs)).toBe(false);
  });

  it('should handle complex branches and diamonds without false positives', () => {
    // Diamond DAG: 4 -> 2, 3; 2 -> 1; 3 -> 1
    const graph: Record<number, number[]> = {
      1: [],
      2: [1],
      3: [1],
      4: [2, 3],
      5: [],
    };
    const getPrereqs = (id: number) => graph[id] || [];

    // Adding 5 as prereq to 4
    expect(wouldCreateCycle(4, [2, 3, 5], getPrereqs)).toBe(false);

    // But making 4 a prereq of 1 creates cycle
    expect(wouldCreateCycle(1, [4], getPrereqs)).toBe(true);
  });
});
