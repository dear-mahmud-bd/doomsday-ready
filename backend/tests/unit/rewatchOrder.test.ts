import { describe, it, expect } from 'vitest';
import { calculateRewatchOrder } from '../../src/algorithms/rewatchOrder.js';
import { MovieNode } from '../../src/algorithms/types.js';

describe('Rewatch Order Algorithm (calculateRewatchOrder)', () => {
  // Sample MCU data from docs/SPEC.md
  const sampleMovies: MovieNode[] = [
    { id: 1, title: 'Iron Man', releaseYear: 2008, runtime: 126, watched: false, prerequisites: [] },
    { id: 2, title: 'Captain America: The First Avenger', releaseYear: 2011, runtime: 124, watched: false, prerequisites: [] },
    { id: 3, title: 'The Avengers', releaseYear: 2012, runtime: 143, watched: false, prerequisites: [1, 2] },
    { id: 4, title: 'Captain America: Civil War', releaseYear: 2016, runtime: 147, watched: false, prerequisites: [3] },
    { id: 5, title: 'Thor: Ragnarok', releaseYear: 2017, runtime: 130, watched: false, prerequisites: [] },
    { id: 6, title: 'Avengers: Infinity War', releaseYear: 2018, runtime: 149, watched: false, prerequisites: [4, 5] },
    { id: 7, title: 'Avengers: Endgame', releaseYear: 2019, runtime: 181, watched: false, prerequisites: [6] },
    { id: 8, title: 'Avengers: Doomsday', releaseYear: 2026, runtime: 180, watched: false, prerequisites: [7] },
  ];

  const getMovieMap = (movies = sampleMovies): Map<number, MovieNode> => {
    return new Map(movies.map((m) => [m.id, { ...m }]));
  };

  it('SPEC acceptance: Rewatch Thor: Ragnarok (5) -> empty list', () => {
    const movies = getMovieMap();
    const result = calculateRewatchOrder(5, movies);

    expect(result.target).toEqual({ id: 5, title: 'Thor: Ragnarok' });
    expect(result.order).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.watchedCount).toBe(0);
    expect(result.remainingRuntime).toBe(0);
  });

  it('SPEC acceptance: Rewatch Civil War (4) -> Iron Man and First Avenger before The Avengers', () => {
    const movies = getMovieMap();
    const result = calculateRewatchOrder(4, movies);

    expect(result.target).toEqual({ id: 4, title: 'Captain America: Civil War' });
    expect(result.total).toBe(3);

    const titles = result.order.map((m) => m.title);
    expect(titles).toHaveLength(3);

    // The Avengers (3) must come AFTER Iron Man (1) and First Avenger (2)
    const avengersIdx = titles.indexOf('The Avengers');
    const ironManIdx = titles.indexOf('Iron Man');
    const cap1Idx = titles.indexOf('Captain America: The First Avenger');

    expect(ironManIdx).toBeGreaterThanOrEqual(0);
    expect(cap1Idx).toBeGreaterThanOrEqual(0);
    expect(avengersIdx).toBeGreaterThan(ironManIdx);
    expect(avengersIdx).toBeGreaterThan(cap1Idx);
  });

  it('SPEC acceptance: Rewatch Doomsday (8) -> all other 7 movies in valid order, target excluded', () => {
    const movies = getMovieMap();
    const result = calculateRewatchOrder(8, movies);

    expect(result.target).toEqual({ id: 8, title: 'Avengers: Doomsday' });
    expect(result.total).toBe(7);
    expect(result.order.map((m) => m.id)).not.toContain(8);

    // Verify topological validity: every movie must appear AFTER all its prerequisites
    const positionMap = new Map<number, number>();
    result.order.forEach((movie, idx) => {
      positionMap.set(movie.id, idx);
    });

    for (const movie of result.order) {
      const currentPos = positionMap.get(movie.id)!;
      for (const prereqId of movie.prerequisites) {
        const prereqPos = positionMap.get(prereqId);
        expect(prereqPos).toBeDefined();
        expect(currentPos).toBeGreaterThan(prereqPos!);
      }
    }
  });

  it('Diamond dependency: should include shared prerequisites exactly once', () => {
    // 4 -> 2, 3; 2 -> 1; 3 -> 1
    const moviesMap = new Map<number, MovieNode>([
      [1, { id: 1, title: 'Root', releaseYear: 2000, runtime: 100, watched: false, prerequisites: [] }],
      [2, { id: 2, title: 'Branch A', releaseYear: 2001, runtime: 100, watched: false, prerequisites: [1] }],
      [3, { id: 3, title: 'Branch B', releaseYear: 2002, runtime: 100, watched: false, prerequisites: [1] }],
      [4, { id: 4, title: 'Target', releaseYear: 2003, runtime: 100, watched: false, prerequisites: [2, 3] }],
    ]);

    const result = calculateRewatchOrder(4, moviesMap);
    expect(result.total).toBe(3);
    const ids = result.order.map((m) => m.id);
    expect(ids).toEqual(expect.arrayContaining([1, 2, 3]));
    expect(ids.filter((id) => id === 1)).toHaveLength(1);
    expect(ids.indexOf(1)).toBeLessThan(ids.indexOf(2));
    expect(ids.indexOf(1)).toBeLessThan(ids.indexOf(3));
  });

  it('calculates watchedCount and remainingRuntime correctly', () => {
    const movies = getMovieMap();
    // Mark Iron Man (126 min) and First Avenger (124 min) as watched
    movies.get(1)!.watched = true;
    movies.get(2)!.watched = true;

    const result = calculateRewatchOrder(4, movies);
    // Order has 3 movies: Iron Man (watched, 126), First Avenger (watched, 124), The Avengers (unwatched, 143)
    expect(result.total).toBe(3);
    expect(result.watchedCount).toBe(2);
    expect(result.remainingRuntime).toBe(143);
  });

  it('throws an error if target movie does not exist', () => {
    const movies = getMovieMap();
    expect(() => calculateRewatchOrder(999, movies)).toThrow('Movie with id 999 not found');
  });
});
