import { MovieNode } from '../algorithms/types.js';
import { pool } from '../db/index.js';

export interface MovieRepository {
  findAll(): Promise<MovieNode[]>;
  findById(id: number): Promise<MovieNode | null>;
  findByTitle(title: string): Promise<MovieNode | null>;
  create(movie: Omit<MovieNode, 'id'>): Promise<MovieNode>;
  update(id: number, movie: Partial<Omit<MovieNode, 'id'>>): Promise<MovieNode>;
  deletePrerequisites(movieId: number): Promise<void>;
  addPrerequisites(movieId: number, prereqIds: number[]): Promise<void>;
  clearAll?(): Promise<void>;
}

export class PgMovieRepository implements MovieRepository {
  async findAll(): Promise<MovieNode[]> {
    const query = `
      SELECT 
        m.id, 
        m.title, 
        m.release_year as "releaseYear", 
        m.runtime, 
        m.watched,
        COALESCE(
          ARRAY_AGG(mp.prerequisite_id ORDER BY mp.prerequisite_id) FILTER (WHERE mp.prerequisite_id IS NOT NULL),
          '{}'
        ) as prerequisites
      FROM movies m
      LEFT JOIN movie_prerequisites mp ON m.id = mp.movie_id
      GROUP BY m.id
      ORDER BY m.id ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async findById(id: number): Promise<MovieNode | null> {
    const query = `
      SELECT 
        m.id, 
        m.title, 
        m.release_year as "releaseYear", 
        m.runtime, 
        m.watched,
        COALESCE(
          ARRAY_AGG(mp.prerequisite_id ORDER BY mp.prerequisite_id) FILTER (WHERE mp.prerequisite_id IS NOT NULL),
          '{}'
        ) as prerequisites
      FROM movies m
      LEFT JOIN movie_prerequisites mp ON m.id = mp.movie_id
      WHERE m.id = $1
      GROUP BY m.id;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async findByTitle(title: string): Promise<MovieNode | null> {
    const query = `
      SELECT 
        m.id, 
        m.title, 
        m.release_year as "releaseYear", 
        m.runtime, 
        m.watched,
        COALESCE(
          ARRAY_AGG(mp.prerequisite_id ORDER BY mp.prerequisite_id) FILTER (WHERE mp.prerequisite_id IS NOT NULL),
          '{}'
        ) as prerequisites
      FROM movies m
      LEFT JOIN movie_prerequisites mp ON m.id = mp.movie_id
      WHERE LOWER(m.title) = LOWER($1)
      GROUP BY m.id;
    `;
    const { rows } = await pool.query(query, [title]);
    return rows[0] || null;
  }

  async create(data: Omit<MovieNode, 'id'>): Promise<MovieNode> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const insertMovieQuery = `
        INSERT INTO movies (title, release_year, runtime, watched)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, release_year as "releaseYear", runtime, watched;
      `;
      const { rows } = await client.query(insertMovieQuery, [
        data.title,
        data.releaseYear,
        data.runtime,
        data.watched,
      ]);
      const createdMovie = rows[0];

      if (data.prerequisites && data.prerequisites.length > 0) {
        for (const prereqId of data.prerequisites) {
          await client.query(
            'INSERT INTO movie_prerequisites (movie_id, prerequisite_id) VALUES ($1, $2)',
            [createdMovie.id, prereqId]
          );
        }
      }

      await client.query('COMMIT');
      return {
        ...createdMovie,
        prerequisites: data.prerequisites || [],
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async update(id: number, data: Partial<Omit<MovieNode, 'id'>>): Promise<MovieNode> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const sets: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      if (data.title !== undefined) {
        sets.push(`title = $${idx++}`);
        values.push(data.title);
      }
      if (data.releaseYear !== undefined) {
        sets.push(`release_year = $${idx++}`);
        values.push(data.releaseYear);
      }
      if (data.runtime !== undefined) {
        sets.push(`runtime = $${idx++}`);
        values.push(data.runtime);
      }
      if (data.watched !== undefined) {
        sets.push(`watched = $${idx++}`);
        values.push(data.watched);
      }

      if (sets.length > 0) {
        values.push(id);
        const updateQuery = `
          UPDATE movies
          SET ${sets.join(', ')}
          WHERE id = $${idx}
        `;
        await client.query(updateQuery, values);
      }

      if (data.prerequisites !== undefined) {
        await client.query('DELETE FROM movie_prerequisites WHERE movie_id = $1', [id]);
        for (const prereqId of data.prerequisites) {
          await client.query(
            'INSERT INTO movie_prerequisites (movie_id, prerequisite_id) VALUES ($1, $2)',
            [id, prereqId]
          );
        }
      }

      await client.query('COMMIT');
      const updated = await this.findById(id);
      return updated!;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async deletePrerequisites(movieId: number): Promise<void> {
    await pool.query('DELETE FROM movie_prerequisites WHERE movie_id = $1', [movieId]);
  }

  async addPrerequisites(movieId: number, prereqIds: number[]): Promise<void> {
    for (const prereqId of prereqIds) {
      await pool.query(
        'INSERT INTO movie_prerequisites (movie_id, prerequisite_id) VALUES ($1, $2)',
        [movieId, prereqId]
      );
    }
  }
}

export class InMemoryMovieRepository implements MovieRepository {
  private movies: Map<number, MovieNode> = new Map();
  private nextId = 1;

  async findAll(): Promise<MovieNode[]> {
    return Array.from(this.movies.values()).map((m) => ({
      ...m,
      prerequisites: [...m.prerequisites],
    }));
  }

  async findById(id: number): Promise<MovieNode | null> {
    const movie = this.movies.get(id);
    if (!movie) return null;
    return { ...movie, prerequisites: [...movie.prerequisites] };
  }

  async findByTitle(title: string): Promise<MovieNode | null> {
    const lower = title.toLowerCase();
    for (const m of this.movies.values()) {
      if (m.title.toLowerCase() === lower) {
        return { ...m, prerequisites: [...m.prerequisites] };
      }
    }
    return null;
  }

  async create(data: Omit<MovieNode, 'id'>): Promise<MovieNode> {
    const id = this.nextId++;
    const movie: MovieNode = {
      id,
      title: data.title,
      releaseYear: data.releaseYear,
      runtime: data.runtime,
      watched: data.watched,
      prerequisites: [...(data.prerequisites || [])],
    };
    this.movies.set(id, movie);
    return { ...movie, prerequisites: [...movie.prerequisites] };
  }

  async update(id: number, data: Partial<Omit<MovieNode, 'id'>>): Promise<MovieNode> {
    const existing = this.movies.get(id);
    if (!existing) {
      throw new Error(`Movie ${id} not found`);
    }

    const updated: MovieNode = {
      ...existing,
      title: data.title !== undefined ? data.title : existing.title,
      releaseYear: data.releaseYear !== undefined ? data.releaseYear : existing.releaseYear,
      runtime: data.runtime !== undefined ? data.runtime : existing.runtime,
      watched: data.watched !== undefined ? data.watched : existing.watched,
      prerequisites:
        data.prerequisites !== undefined ? [...data.prerequisites] : existing.prerequisites,
    };

    this.movies.set(id, updated);
    return { ...updated, prerequisites: [...updated.prerequisites] };
  }

  async deletePrerequisites(movieId: number): Promise<void> {
    const movie = this.movies.get(movieId);
    if (movie) {
      movie.prerequisites = [];
    }
  }

  async addPrerequisites(movieId: number, prereqIds: number[]): Promise<void> {
    const movie = this.movies.get(movieId);
    if (movie) {
      movie.prerequisites = Array.from(new Set([...movie.prerequisites, ...prereqIds]));
    }
  }

  async clearAll(): Promise<void> {
    this.movies.clear();
    this.nextId = 1;
  }
}
