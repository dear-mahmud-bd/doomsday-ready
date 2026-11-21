# Project: Doomsday Ready (Blinto Talent Accelerator 2027 - Full Stack Intern Assessment)

Full-stack app: MCU rewatch planner (graph problem) + opening-night bundle
booking (coin-change DP problem). Backend (Express + TypeScript + PostgreSQL +
Swagger) and frontend (Vite + React + TypeScript) live in SEPARATE folders.

Source of truth: `docs/SPEC.md`. Never contradict it. Skills live in `.agent/skills/`.

## Hard rules
1. Rewatch order, cycle detection and booking (coin change) are written from
   scratch in `backend/src/algorithms/`. NO graph / DP / toposort libraries.
2. Algorithms are pure functions: no DB, no Express imports.
3. Never mix backend and frontend code. Frontend talks to backend only via `/api`.
4. TypeScript strict. No `any` without a justifying comment.
5. API prefix `/api`. Error shape: `{ "error": { "code": "...", "message": "..." } }`.
   Circular dependency => `409 CIRCULAR_DEPENDENCY`.
6. The backend MUST ship Swagger/OpenAPI docs at `/api/docs`; every endpoint change
   updates `backend/src/docs/openapi.yaml` in the same commit (skill: swagger-api-docs).
7. Ambiguity => choose a reasonable default, append to `docs/DECISIONS.md`.
8. After every task, append an entry to `docs/AI_USAGE.md` (honest, specific).

## Workflow (spec-driven, one task at a time)
Use skill `spec-driven-task` for every task in `docs/TASKS.md`:
spec -> STOP for approval -> build (tests first) -> validate -> commit -> STOP.
- Never start task N+1 without being told.
- Typecheck + tests must pass before every commit.
- Commits: Conventional Commits (skill: conventional-commit), message taken from TASKS.md.
- Do not add features outside SPEC.md without asking.
- Never commit `node_modules` or `.env`.

## Skills index
| Skill | Use when |
|---|---|
| spec-driven-task | starting/executing any task |
| algorithm-tdd | tasks 4 and 5 (graph + DP) |
| swagger-api-docs | any backend route/schema change (tasks 3, 6, 7) |
| frontend-ui-standards | frontend layout, responsive Tailwind styling (tasks 8, 9, 10) |
| validate-and-report | before every commit and at the end |
| conventional-commit | every commit |
