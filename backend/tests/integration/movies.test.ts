import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { movieService } from '../../src/services/movieService.js';

describe('Movies API (/api/movies)', () => {
  beforeEach(async () => {
    await movieService.resetForTest();
  });

  describe('POST /api/movies', () => {
    it('creates a movie successfully with valid data', async () => {
      const res = await request(app)
        .post('/api/movies')
        .send({
          title: 'Iron Man',
          releaseYear: 2008,
          runtime: 126,
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(Number),
        title: 'Iron Man',
        releaseYear: 2008,
        runtime: 126,
        watched: false,
        prerequisites: [],
      });
    });

    it('rejects duplicate title with 409 DUPLICATE_TITLE (case-insensitive)', async () => {
      await request(app).post('/api/movies').send({
        title: 'Iron Man',
        releaseYear: 2008,
        runtime: 126,
      });

      const res = await request(app).post('/api/movies').send({
        title: 'iron man',
        releaseYear: 2008,
        runtime: 126,
      });

      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        error: {
          code: 'DUPLICATE_TITLE',
          message: 'A movie with this title already exists',
        },
      });
    });

    it('rejects invalid runtime with 400 VALIDATION_ERROR', async () => {
      const res = await request(app).post('/api/movies').send({
        title: 'Invalid Movie',
        releaseYear: 2020,
        runtime: 350, // exceeds 300
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects invalid prerequisite ID with 400 INVALID_PREREQUISITE', async () => {
      const res = await request(app).post('/api/movies').send({
        title: 'The Avengers',
        releaseYear: 2012,
        runtime: 143,
        prerequisites: [9999],
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_PREREQUISITE');
    });
  });

  describe('GET /api/movies', () => {
    it('returns a list of movies', async () => {
      await request(app).post('/api/movies').send({
        title: 'Iron Man',
        releaseYear: 2008,
        runtime: 126,
      });
      await request(app).post('/api/movies').send({
        title: 'The First Avenger',
        releaseYear: 2011,
        runtime: 124,
      });

      const res = await request(app).get('/api/movies');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].title).toBe('Iron Man');
    });
  });

  describe('PATCH /api/movies/:id', () => {
    it('updates movie fields successfully', async () => {
      const createRes = await request(app).post('/api/movies').send({
        title: 'Iron Man',
        releaseYear: 2008,
        runtime: 126,
      });
      const id = createRes.body.id;

      const patchRes = await request(app)
        .patch(`/api/movies/${id}`)
        .send({ watched: true });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.watched).toBe(true);
    });

    it('detects circular dependencies and returns 409 CIRCULAR_DEPENDENCY', async () => {
      // 1. Create Iron Man (1)
      const m1 = await request(app).post('/api/movies').send({
        title: 'Iron Man',
        releaseYear: 2008,
        runtime: 126,
      });
      // 2. Create Avengers (2) depending on Iron Man (1)
      const m2 = await request(app).post('/api/movies').send({
        title: 'The Avengers',
        releaseYear: 2012,
        runtime: 143,
        prerequisites: [m1.body.id],
      });
      // 3. Create Endgame (3) depending on Avengers (2)
      const m3 = await request(app).post('/api/movies').send({
        title: 'Endgame',
        releaseYear: 2019,
        runtime: 181,
        prerequisites: [m2.body.id],
      });

      // Attempt to make Endgame (3) a prerequisite of Iron Man (1) -> cycle!
      const patchRes = await request(app)
        .patch(`/api/movies/${m1.body.id}`)
        .send({ prerequisites: [m3.body.id] });

      expect(patchRes.status).toBe(409);
      expect(patchRes.body.error.code).toBe('CIRCULAR_DEPENDENCY');
      expect(patchRes.body.error.message).toContain('cyclic dependency');
    });

    it('returns 404 for nonexistent movie', async () => {
      const res = await request(app)
        .patch('/api/movies/999')
        .send({ watched: true });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/movies/:id/rewatch-order', () => {
    it('returns full MCU rewatch order, watched count and remaining runtime', async () => {
      // Create MCU sample sequence
      const m1 = (await request(app).post('/api/movies').send({ title: 'Iron Man', releaseYear: 2008, runtime: 126, watched: true })).body;
      const m2 = (await request(app).post('/api/movies').send({ title: 'Captain America: The First Avenger', releaseYear: 2011, runtime: 124, watched: false })).body;
      const m3 = (await request(app).post('/api/movies').send({ title: 'The Avengers', releaseYear: 2012, runtime: 143, watched: false, prerequisites: [m1.id, m2.id] })).body;
      const m4 = (await request(app).post('/api/movies').send({ title: 'Captain America: Civil War', releaseYear: 2016, runtime: 147, watched: false, prerequisites: [m3.id] })).body;
      const m5 = (await request(app).post('/api/movies').send({ title: 'Thor: Ragnarok', releaseYear: 2017, runtime: 130, watched: true })).body;
      const m6 = (await request(app).post('/api/movies').send({ title: 'Avengers: Infinity War', releaseYear: 2018, runtime: 149, watched: false, prerequisites: [m4.id, m5.id] })).body;
      const m7 = (await request(app).post('/api/movies').send({ title: 'Avengers: Endgame', releaseYear: 2019, runtime: 181, watched: false, prerequisites: [m6.id] })).body;
      const m8 = (await request(app).post('/api/movies').send({ title: 'Avengers: Doomsday', releaseYear: 2026, runtime: 180, watched: false, prerequisites: [m7.id] })).body;

      // Rewatch Doomsday (m8)
      const res = await request(app).get(`/api/movies/${m8.id}/rewatch-order`);
      expect(res.status).toBe(200);
      expect(res.body.target).toEqual({ id: m8.id, title: 'Avengers: Doomsday' });
      expect(res.body.total).toBe(7);
      expect(res.body.watchedCount).toBe(2); // Iron Man (126) and Ragnarok (130) are watched
      expect(res.body.remainingRuntime).toBe(124 + 143 + 147 + 149 + 181); // 744 mins

      // Order must be topologically valid: Avengers (m3) comes after Iron Man (m1) and First Avenger (m2)
      const orderIds = res.body.order.map((m: { id: number }) => m.id);
      expect(orderIds.indexOf(m1.id)).toBeLessThan(orderIds.indexOf(m3.id));
      expect(orderIds.indexOf(m2.id)).toBeLessThan(orderIds.indexOf(m3.id));
    });

    it('returns empty list for movie with no prerequisites (Thor: Ragnarok)', async () => {
      const ragnarok = (await request(app).post('/api/movies').send({
        title: 'Thor: Ragnarok',
        releaseYear: 2017,
        runtime: 130,
      })).body;

      const res = await request(app).get(`/api/movies/${ragnarok.id}/rewatch-order`);
      expect(res.status).toBe(200);
      expect(res.body.order).toEqual([]);
      expect(res.body.total).toBe(0);
      expect(res.body.watchedCount).toBe(0);
      expect(res.body.remainingRuntime).toBe(0);
    });

    it('returns 404 for unknown movie ID', async () => {
      const res = await request(app).get('/api/movies/9999/rewatch-order');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
