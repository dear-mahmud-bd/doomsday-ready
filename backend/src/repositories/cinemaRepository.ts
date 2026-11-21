import { pool } from '../db/index.js';

export interface CinemaEntity {
  id: number;
  name: string;
  bundleSizes: number[];
}

export interface CinemaRepository {
  findAll(): Promise<CinemaEntity[]>;
  findById(id: number): Promise<CinemaEntity | null>;
  findByName(name: string): Promise<CinemaEntity | null>;
  create(data: Omit<CinemaEntity, 'id'>): Promise<CinemaEntity>;
  clearAll?(): Promise<void>;
}

export class PgCinemaRepository implements CinemaRepository {
  async findAll(): Promise<CinemaEntity[]> {
    const query = `
      SELECT 
        c.id, 
        c.name, 
        COALESCE(
          ARRAY_AGG(cb.size ORDER BY cb.size ASC) FILTER (WHERE cb.size IS NOT NULL),
          '{}'
        ) as "bundleSizes"
      FROM cinemas c
      LEFT JOIN cinema_bundles cb ON c.id = cb.cinema_id
      GROUP BY c.id
      ORDER BY c.id ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async findById(id: number): Promise<CinemaEntity | null> {
    const query = `
      SELECT 
        c.id, 
        c.name, 
        COALESCE(
          ARRAY_AGG(cb.size ORDER BY cb.size ASC) FILTER (WHERE cb.size IS NOT NULL),
          '{}'
        ) as "bundleSizes"
      FROM cinemas c
      LEFT JOIN cinema_bundles cb ON c.id = cb.cinema_id
      WHERE c.id = $1
      GROUP BY c.id;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async findByName(name: string): Promise<CinemaEntity | null> {
    const query = `
      SELECT 
        c.id, 
        c.name, 
        COALESCE(
          ARRAY_AGG(cb.size ORDER BY cb.size ASC) FILTER (WHERE cb.size IS NOT NULL),
          '{}'
        ) as "bundleSizes"
      FROM cinemas c
      LEFT JOIN cinema_bundles cb ON c.id = cb.cinema_id
      WHERE LOWER(c.name) = LOWER($1)
      GROUP BY c.id;
    `;
    const { rows } = await pool.query(query, [name]);
    return rows[0] || null;
  }

  async create(data: Omit<CinemaEntity, 'id'>): Promise<CinemaEntity> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const insertCinema = `
        INSERT INTO cinemas (name)
        VALUES ($1)
        RETURNING id, name;
      `;
      const { rows } = await client.query(insertCinema, [data.name]);
      const created = rows[0];

      for (const size of data.bundleSizes) {
        await client.query(
          'INSERT INTO cinema_bundles (cinema_id, size) VALUES ($1, $2)',
          [created.id, size]
        );
      }

      await client.query('COMMIT');
      return {
        id: created.id,
        name: created.name,
        bundleSizes: [...data.bundleSizes].sort((a, b) => a - b),
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

export class InMemoryCinemaRepository implements CinemaRepository {
  private cinemas: Map<number, CinemaEntity> = new Map();
  private nextId = 1;

  async findAll(): Promise<CinemaEntity[]> {
    return Array.from(this.cinemas.values()).map((c) => ({
      ...c,
      bundleSizes: [...c.bundleSizes],
    }));
  }

  async findById(id: number): Promise<CinemaEntity | null> {
    const cinema = this.cinemas.get(id);
    if (!cinema) return null;
    return { ...cinema, bundleSizes: [...cinema.bundleSizes] };
  }

  async findByName(name: string): Promise<CinemaEntity | null> {
    const lower = name.toLowerCase();
    for (const c of this.cinemas.values()) {
      if (c.name.toLowerCase() === lower) {
        return { ...c, bundleSizes: [...c.bundleSizes] };
      }
    }
    return null;
  }

  async create(data: Omit<CinemaEntity, 'id'>): Promise<CinemaEntity> {
    const id = this.nextId++;
    const entity: CinemaEntity = {
      id,
      name: data.name,
      bundleSizes: [...data.bundleSizes].sort((a, b) => a - b),
    };
    this.cinemas.set(id, entity);
    return { ...entity, bundleSizes: [...entity.bundleSizes] };
  }

  async clearAll(): Promise<void> {
    this.cinemas.clear();
    this.nextId = 1;
  }
}
