---
name: spec-driven-task
description: Run any task from docs/TASKS.md as spec -> approve -> build -> validate -> commit. Use whenever the user says "do task N", "start the next task", "implement", or asks for a feature in this repo, even if they do not mention specs. Prevents building before a spec is approved.
---

# Spec-driven task loop

## Phase 1: Spec (no code)
1. Read the task entry in `docs/TASKS.md` and the relevant parts of `docs/SPEC.md`.
2. Copy `docs/specs/_TEMPLATE.md` to `docs/specs/NN-<name>.md` and fill it in
   (Goal, Scope in/out, Files, Behavior, Test cases, Acceptance criteria, Assumptions).
   Light tasks (1, 2, 11, 12) may use a 5-10 line spec or skip the file.
3. Put any new assumption in `docs/DECISIONS.md`.
4. **STOP.** Show the spec summary and wait for explicit approval.

## Phase 2: Build
1. Implement only what the approved spec says. Deviation => update the spec first and tell the user.
2. Tests first when the task has logic (see `algorithm-tdd`).
3. Backend route/schema changes => follow `swagger-api-docs`.

## Phase 3: Validate
Run `validate-and-report`. Report pass/fail per acceptance criterion. Fix failures before continuing.

## Phase 4: Record and commit
1. Tick the task in `docs/TASKS.md`.
2. Append to `docs/AI_USAGE.md`: task, what the agent did, what the human reviewed/changed.
3. Commit spec + code + docs together using `conventional-commit` with the message from TASKS.md.
4. **STOP** and summarize. Never start the next task unprompted.
