import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('Swagger Documentation & OpenAPI Spec', () => {
  it('should serve raw openapi.json with valid OpenAPI 3.0 info and paths', async () => {
    const res = await request(app).get('/api/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.openapi).toMatch(/^3\.0\./);
    expect(res.body.info).toBeDefined();
    expect(res.body.info.title).toBe('Doomsday Ready API');
    expect(res.body.paths).toHaveProperty('/health');
  });

  it('should serve Swagger UI at /api/docs/', async () => {
    const res = await request(app).get('/api/docs/');
    // swagger-ui-express returns 200 or 301 redirect
    expect([200, 301]).toContain(res.status);
    if (res.status === 200) {
      expect(res.text).toContain('Swagger UI');
    }
  });
});
