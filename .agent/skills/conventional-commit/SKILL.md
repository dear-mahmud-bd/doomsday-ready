---
name: conventional-commit
description: Create clean git commits using Conventional Commits with the exact messages planned in docs/TASKS.md. Use whenever committing, staging files, or writing a commit message in this repo.
---

# Conventional commits
- Format: `type(scope): imperative summary`, <= 72 chars. Types: feat, fix, chore, docs, test, refactor.
- Use the message listed in `docs/TASKS.md` for the task unless the user says otherwise.
- One logical change per commit; spec file + code + docs of that task go in the same commit.
- Stage explicitly (`git add <paths>`), check `git status` and `git diff --staged` first.
- Never commit `.env`, `node_modules`, build output. Never amend or force-push unless asked.
