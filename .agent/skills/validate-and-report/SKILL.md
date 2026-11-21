---
name: validate-and-report
description: Verify work before committing or finishing a task - typecheck, tests, acceptance criteria, forbidden-library scan, API example checks. Use before every commit, at the end of a task, and for the final project check, even if the user only says "check", "verify" or "is it done".
---

# Validate and report

Run what exists for the current stage and report pass/fail per item. Never claim success without output.

1. `cd backend && npx tsc --noEmit && npm test` (and `cd frontend && npx tsc --noEmit && npm run build` once it exists).
2. Acceptance criteria from `docs/specs/NN-*.md`: list each with PASS/FAIL and evidence.
3. Forbidden libraries: `grep -rniE "graphlib|toposort|dagre|js-graph|coin-change" backend/src/algorithms` must be empty.
4. API (when running): curl the SPEC.md examples; confirm 400/404/409 cases and `/api/docs` loads.
5. Secrets: no `.env`, no `node_modules` staged (`git status`).
6. Final check: `docker compose up --build` from a fresh clone, README steps work, 12 clean commits.

Report as a table `Check | Result | Evidence`. If anything fails, fix and re-run; do not commit on red.
