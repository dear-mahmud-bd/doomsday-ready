import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { cinemaService } from '../../src/services/cinemaService.js';

describe('Cinemas & Booking API (/api/cinemas)', () => {
  beforeEach(async () => {
    await cinemaService.resetForTest();
  });

  describe('POST /api/cinemas', () => {
    it('creates cinema successfully with sorted bundle sizes', async () => {
      const res = await request(app)
        .post('/api/cinemas')
        .send({
          name: 'Stark Odeon',
          bundleSizes: [5, 2], // unordered
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: expect.any(Number),
        name: 'Stark Odeon',
        bundleSizes: [2, 5], // sorted ascending
      });
    });

    it('rejects duplicate cinema name with 409 DUPLICATE_NAME (case-insensitive)', async () => {
      await request(app).post('/api/cinemas').send({
        name: 'Stark Odeon',
        bundleSizes: [2, 5],
      });

      const res = await request(app).post('/api/cinemas').send({
        name: 'stark odeon',
        bundleSizes: [3, 4],
      });

      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        error: {
          code: 'DUPLICATE_NAME',
          message: 'A cinema with this name already exists',
        },
      });
    });

    it('rejects duplicate bundle sizes with 400 VALIDATION_ERROR', async () => {
      const res = await request(app).post('/api/cinemas').send({
        name: 'Invalid Cinema',
        bundleSizes: [2, 2, 5],
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects bundle sizes outside 1..500', async () => {
      const res = await request(app).post('/api/cinemas').send({
        name: 'Invalid Cinema',
        bundleSizes: [0, 501],
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects empty bundle sizes or more than 10 sizes', async () => {
      const res1 = await request(app).post('/api/cinemas').send({
        name: 'Empty Cinema',
        bundleSizes: [],
      });
      expect(res1.status).toBe(400);

      const res2 = await request(app).post('/api/cinemas').send({
        name: 'Too Many Cinema',
        bundleSizes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      });
      expect(res2.status).toBe(400);
    });
  });

  describe('GET /api/cinemas', () => {
    it('returns a list of all cinemas', async () => {
      await request(app).post('/api/cinemas').send({ name: 'Cinema A', bundleSizes: [2, 5] });
      await request(app).post('/api/cinemas').send({ name: 'Cinema B', bundleSizes: [1, 3, 4] });

      const res = await request(app).get('/api/cinemas');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe('Cinema A');
      expect(res.body[1].name).toBe('Cinema B');
    });
  });

  describe('GET /api/cinemas/:id/booking', () => {
    it('SPEC acceptance: bundles [2, 5] with groupSize 11 -> 4 bundles: 5 x 1, 2 x 3', async () => {
      const createRes = await request(app).post('/api/cinemas').send({
        name: 'Stark Odeon',
        bundleSizes: [2, 5],
      });
      const cinemaId = createRes.body.id;

      const res = await request(app).get(`/api/cinemas/${cinemaId}/booking?groupSize=11`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        cinema: {
          id: cinemaId,
          name: 'Stark Odeon',
        },
        groupSize: 11,
        possible: true,
        totalBundles: 4,
        bundles: [
          { size: 5, count: 1 },
          { size: 2, count: 3 },
        ],
      });
    });

    it('SPEC acceptance: bundles [6, 9, 20] with groupSize 44 -> 4 bundles: 20 x 1, 9 x 2, 6 x 1', async () => {
      const createRes = await request(app).post('/api/cinemas').send({
        name: 'Wakanda IMAX',
        bundleSizes: [6, 9, 20],
      });
      const cinemaId = createRes.body.id;

      const res = await request(app).get(`/api/cinemas/${cinemaId}/booking?groupSize=44`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        cinema: {
          id: cinemaId,
          name: 'Wakanda IMAX',
        },
        groupSize: 44,
        possible: true,
        totalBundles: 4,
        bundles: [
          { size: 20, count: 1 },
          { size: 9, count: 2 },
          { size: 6, count: 1 },
        ],
      });
    });

    it('SPEC acceptance: bundles [4, 6] with groupSize 7 -> possible: false', async () => {
      const createRes = await request(app).post('/api/cinemas').send({
        name: 'Sanctum Picturehouse',
        bundleSizes: [4, 6],
      });
      const cinemaId = createRes.body.id;

      const res = await request(app).get(`/api/cinemas/${cinemaId}/booking?groupSize=7`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        cinema: {
          id: cinemaId,
          name: 'Sanctum Picturehouse',
        },
        groupSize: 7,
        possible: false,
      });
    });

    it('rejects missing or invalid groupSize with 400 VALIDATION_ERROR', async () => {
      const createRes = await request(app).post('/api/cinemas').send({
        name: 'Test Cinema',
        bundleSizes: [2, 5],
      });
      const cinemaId = createRes.body.id;

      const missingRes = await request(app).get(`/api/cinemas/${cinemaId}/booking`);
      expect(missingRes.status).toBe(400);
      expect(missingRes.body.error.code).toBe('VALIDATION_ERROR');

      const invalidRes = await request(app).get(`/api/cinemas/${cinemaId}/booking?groupSize=-5`);
      expect(invalidRes.status).toBe(400);

      const tooLargeRes = await request(app).get(`/api/cinemas/${cinemaId}/booking?groupSize=10001`);
      expect(tooLargeRes.status).toBe(400);
    });

    it('returns 404 for unknown cinema ID', async () => {
      const res = await request(app).get('/api/cinemas/9999/booking?groupSize=10');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
