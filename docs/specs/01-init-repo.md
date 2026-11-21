# Task 01: Initialize Repository Structure and Agent Guidelines

## Goal
Initialize the local Git repository, establish root directory structure, ensure proper `.gitignore` rules, and register project agent guidelines and skills.

## Scope
- In:
  - Run `git init` and set the initial branch to `main`.
  - Validate and ensure `.gitignore` covers `node_modules`, build outputs (`dist/`, `build/`), environment files (`.env`, `.env.*` except `!.env.example`), logs, and IDE caches.
  - Verify directory structure: `backend/`, `frontend/`, `docs/`, and `.agent/skills/`.
  - Confirm `AGENTS.md` rules and `.agent/skills/` are fully in place.
- Out:
  - Backend dependency installation or scaffolding (reserved for Task 3).
  - Frontend scaffolding (reserved for Task 8).

## Files (created/changed)
- `.git/` (created via `git init`)
- `docs/specs/01-init-repo.md` (this spec file)
- `AGENTS.md` (already updated with frontend standards)
- `.agent/skills/frontend-ui-standards/SKILL.md` (created)
- `.gitignore` (reviewed / verified)
- `docs/TASKS.md` (to tick task 1 once committed)
- `docs/AI_USAGE.md` (log entry for task 1)

## Behavior
- `git status` functions correctly (repository is initialized).
- No sensitive or generated files (`node_modules`, `.env`) are tracked.
- Repository starts cleanly with all baseline project documents and skills tracked.

## Acceptance Criteria
- [x] Git repository is initialized with default branch `main`.
- [x] `.gitignore` accurately ignores dependencies, build artifacts, and secrets.
- [x] Agent rules (`AGENTS.md`) and all 6 skills (`algorithm-tdd`, `swagger-api-docs`, `spec-driven-task`, `validate-and-report`, `conventional-commit`, `frontend-ui-standards`) are present.
- [x] `git status` reports clean or ready-to-stage files with zero forbidden artifacts.
- [x] Initial commit is created with exact message: `chore: initialize repository structure and agent guidelines`.

## Assumptions
- Branch name will be `main`.
- Initial commit will stage the root configuration, documentation, guidelines, skills, and directory placeholders.
