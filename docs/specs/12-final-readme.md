# Task 12: Add README with Data Model Diagram, Assumptions and AI Usage

## Goal
Author the comprehensive, production-grade root `README.md` document satisfying all assessment requirements: project overview, Mermaid Entity-Relationship diagram, algorithm purity explanation, complete API route inventory with Swagger links, articulated decisions and assumptions, local & Docker run instructions, test verification commands, and honest AI usage disclosure.

## Scope
- In:
  - Mermaid ER diagram (`erDiagram`) detailing entities, primary keys, foreign keys, and constraints.
  - Explanation of Feature 1 (topological rewatch order & cycle detection via post-order DFS) and Feature 2 (exact coin-change seat bundles via dynamic programming).
  - Explicit confirmation of zero external graph/DP libraries.
  - Complete API endpoint table with methods, paths, status codes, and error codes.
  - Link to Swagger UI documentation (`http://localhost:4000/api/docs`).
  - Decisions & assumptions section synthesizing all 13 items from `docs/DECISIONS.md`.
  - Step-by-step instructions for:
    - Docker Compose execution (`docker compose up --build`).
    - Local development (PostgreSQL, backend, frontend).
    - Running the full automated test suite (`pnpm test` in backend, `pnpm run build` in frontend).
    - Verifying forbidden library rules (`git grep`).
  - AI Usage disclosure table summarizing all 12 tasks from `docs/AI_USAGE.md`.
- Out:
  - Modifying existing functional code (all features 1-11 are complete and locked).

## Files (created/changed)
- `docs/specs/12-final-readme.md` (this spec)
- `README.md` (comprehensive root documentation)
- `docs/TASKS.md` (final 12th task checkbox)
- `docs/AI_USAGE.md` (final 12th task log entry)

## Acceptance Criteria
- [x] `README.md` contains a valid Mermaid ER diagram rendering `movies`, `movie_prerequisites`, `cinemas`, and `cinema_bundles`.
- [x] Documentation details algorithm implementations and confirms zero external graph/DP libraries.
- [x] API routes table documents `/movies`, `/cinemas`, `/health`, and `/docs` with status codes and error formats.
- [x] Run instructions clearly explain both Docker Compose (`docker compose up --build`) and local dev setups.
- [x] Decisions from `docs/DECISIONS.md` are documented in `README.md`.
- [x] AI usage is honestly disclosed and summarized.
- [x] All 12 tasks in `docs/TASKS.md` marked complete.
- [x] Clean commit created with exact message: `docs: add README with data model diagram, assumptions and AI usage`.
