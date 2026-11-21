import { pool } from './index.js';

interface SeedMovie {
  title: string;
  releaseYear: number;
  runtime: number;
  watched: boolean;
  prerequisites: string[]; // referenced by title for seed readability
}

const MCU_SAMPLE_MOVIES: SeedMovie[] = [
  { title: 'Iron Man', releaseYear: 2008, runtime: 126, watched: false, prerequisites: [] },
  { title: 'Captain America: The First Avenger', releaseYear: 2011, runtime: 124, watched: false, prerequisites: [] },
  { title: 'The Avengers', releaseYear: 2012, runtime: 143, watched: false, prerequisites: ['Iron Man', 'Captain America: The First Avenger'] },
  { title: 'Captain America: Civil War', releaseYear: 2016, runtime: 147, watched: false, prerequisites: ['The Avengers'] },
  { title: 'Thor: Ragnarok', releaseYear: 2017, runtime: 130, watched: false, prerequisites: [] },
  { title: 'Avengers: Infinity War', releaseYear: 2018, runtime: 149, watched: false, prerequisites: ['Captain America: Civil War', 'Thor: Ragnarok'] },
  { title: 'Avengers: Endgame', releaseYear: 2019, runtime: 181, watched: false, prerequisites: ['Avengers: Infinity War'] },
  { title: 'Avengers: Doomsday', releaseYear: 2026, runtime: 180, watched: false, prerequisites: ['Avengers: Endgame'] },
];

const SAMPLE_CINEMAS = [
  { name: 'Stark Odeon', bundleSizes: [2, 5] },
  { name: 'Wakanda IMAX', bundleSizes: [6, 9, 20] },
  { name: 'Avengers Campus Picturehouse', bundleSizes: [1, 3, 4] },
  { name: 'Sanctum Screening Room', bundleSizes: [4, 6] },
];

export async function seedSampleData(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if movies already exist
    const { rows: movieCount } = await client.query('SELECT COUNT(*) as count FROM movies');
    if (parseInt(movieCount[0].count, 10) === 0) {
      console.log('Seeding MCU movies and prerequisites...');
      const titleToId = new Map<string, number>();

      for (const m of MCU_SAMPLE_MOVIES) {
        const insertRes = await client.query(
          `INSERT INTO movies (title, release_year, runtime, watched)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING
           RETURNING id, title;`,
          [m.title, m.releaseYear, m.runtime, m.watched]
        );
        if (insertRes.rows.length > 0) {
          titleToId.set(insertRes.rows[0].title, insertRes.rows[0].id);
        } else {
          // If already existed
          const existing = await client.query('SELECT id, title FROM movies WHERE title = $1', [m.title]);
          titleToId.set(existing.rows[0].title, existing.rows[0].id);
        }
      }

      // Insert prerequisites
      for (const m of MCU_SAMPLE_MOVIES) {
        const movieId = titleToId.get(m.title)!;
        for (const prereqTitle of m.prerequisites) {
          const prereqId = titleToId.get(prereqTitle);
          if (prereqId) {
            await client.query(
              `INSERT INTO movie_prerequisites (movie_id, prerequisite_id)
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING;`,
              [movieId, prereqId]
            );
          }
        }
      }
      console.log('MCU movies seeded successfully.');
    } else {
      console.log('Movies table already contains data, skipping movie seed.');
    }

    // Check if cinemas already exist
    const { rows: cinemaCount } = await client.query('SELECT COUNT(*) as count FROM cinemas');
    if (parseInt(cinemaCount[0].count, 10) === 0) {
      console.log('Seeding sample cinemas and bundle sizes...');
      for (const c of SAMPLE_CINEMAS) {
        const insertRes = await client.query(
          `INSERT INTO cinemas (name)
           VALUES ($1)
           ON CONFLICT DO NOTHING
           RETURNING id;`,
          [c.name]
        );

        if (insertRes.rows.length > 0) {
          const cinemaId = insertRes.rows[0].id;
          for (const size of c.bundleSizes) {
            await client.query(
              `INSERT INTO cinema_bundles (cinema_id, size)
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING;`,
              [cinemaId, size]
            );
          }
        }
      }
      console.log('Sample cinemas seeded successfully.');
    } else {
      console.log('Cinemas table already contains data, skipping cinema seed.');
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Direct execution
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedSampleData()
    .then(() => {
      console.log('Seed completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
