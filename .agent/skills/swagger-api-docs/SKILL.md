---
name: swagger-api-docs
description: Create and maintain Swagger/OpenAPI 3 documentation for the Express backend, served at /api/docs with the raw spec at /api/openapi.json. Use whenever adding or changing any backend endpoint, request/response schema, status code or error code, when scaffolding the backend, or when the user mentions Swagger, OpenAPI, API docs, or API reference.
---

# Swagger / OpenAPI docs for the backend

## Approach: one hand-written spec file = single source of truth
- File: `backend/src/docs/openapi.yaml` (OpenAPI 3.0.3). Do NOT scatter JSDoc comments.
- Packages: `swagger-ui-express`, `yaml`; dev: `@types/swagger-ui-express`.
- Wire-up in `backend/src/docs/swagger.ts`, mounted in `app.ts` BEFORE the 404 handler:
  - `GET /api/docs` -> Swagger UI
  - `GET /api/openapi.json` -> parsed spec as JSON
- Copy `openapi.yaml` into the build output (Dockerfile / build script) so it works in the container.

## Spec contents (must cover every SPEC.md endpoint)
- `info` (title Doomsday Ready API, version), `servers: [{url: /api}]`, tags: Movies, Cinemas, Health.
- `components.schemas`: Movie, MovieCreate, MoviePatch, RewatchOrderResponse, Cinema, CinemaCreate,
  BookingResponse (possible true/false variants), ErrorResponse.
- `components.responses`: reusable 400 ValidationError, 404 NotFound, 409 Conflict.
- Every operation: summary, tags, params (`groupSize` min 1 max 10000), requestBody with an `example`,
  every status code with an example. 409 must show both `CIRCULAR_DEPENDENCY` and `DUPLICATE_TITLE`.
- Include the assessment examples (Endgame -> Iron Man, {2,5}/11, {4,6}/7) as `examples`.

## Rules
1. Any route/schema/status change updates `openapi.yaml` in the SAME commit.
2. Constraints identical to validators (runtime 1-300, bundle sizes 1-10 distinct, each 1-500).
3. Test `tests/integration/docs.test.ts`: `/api/docs` returns 200, `/api/openapi.json` parses,
   and every path+method from SPEC.md exists in it (guards against drift).
4. Validate the YAML before committing (parse it in the test; optionally `npx @redocly/cli lint`).
5. README links to `http://localhost:4000/api/docs`.
