# AI usage log (summarized in README)

Tools: Antigravity CLI agent (code drafting) + Claude chat (planning, learning the algorithms).
Rule: I read and can explain every line of the algorithms; the agent drafts, I review.

| Task | What AI did | What I reviewed / changed |
|---|---|---|
| 1. Repository init & guidelines | Initialized git repository, added frontend-ui-standards skill, prepared Task 1 spec, updated docs/DECISIONS.md | Reviewed repository structure, .gitignore rules, skills catalog, and approved Task 1 spec |
| 2. Specification and planning | Refined docs/PLAN.md with 5-layer backend architecture, schema constraints, testing strategy, and prepared Task 2 spec | Reviewed system architecture, database schema, error code taxonomy, and approved Task 2 spec |
| 3. Backend scaffolding & Swagger | Scaffolded Express TypeScript backend, DB migrations, error handler, Swagger UI at /api/docs, health route, integration tests | Reviewed schema constraints, OpenAPI 3.0 specification, test coverage, and approved Task 3 spec |
| 4. Cycle detection & rewatch order | Implemented pure cycle detection and topological rewatch order algorithms + unit test suites test-first | Reviewed graph traversal logic, SPEC test cases, runtime arithmetic, and approved Task 4 spec |
| 5. Coin-change booking algorithm | Implemented pure DP seat bundle optimization algorithm + unit test suite including greedy-fails case and 10k stress benchmark | Reviewed DP state transitions, reconstruction logic, benchmark performance, and approved Task 5 spec |
| 6. Movies API & OpenAPI docs | Implemented movies routes (POST/GET/PATCH/rewatch-order), validation, service/repository layer, circular dependency checks, openapi.yaml updates, integration tests | Reviewed OpenAPI paths, HTTP status/error mapping, integration test suite, and approved Task 6 spec |
| 7. Cinemas API & booking quotes | Implemented cinemas CRUD, booking quote endpoint, input validation, repository/service layer, openapi.yaml paths, drift tests, and integration tests | Reviewed booking query validation, quote response payload shapes, OpenAPI documentation, and approved Task 7 spec |
| 8. Frontend scaffolding & API client | Scaffolded Vite + React + TypeScript with Tailwind CSS, responsive app shell Layout, typed API client (movies, cinemas, rewatch, booking), and router | Reviewed Tailwind setup, layout navigation, typed API wrappers, build output, and approved Task 8 spec |
| 9. Movies view & prerequisites | Implemented MoviesPage with optimistic watched toggling, MovieCard, AddMovieModal, and EditPrerequisitesModal with circular dependency alert | Reviewed UI responsiveness, optimistic update behavior, cycle prevention alerts, and approved Task 9 spec |
| 10. Rewatch & booking views | Implemented RewatchPage with topological sequence, progress bar, runtime calculator, and BookingPage with DP quote display and Not Possible state | Reviewed progress calculations, DP quote display chips, cinema registration modal, and approved Task 10 spec |
| 11. Docker setup & seed data | Created multi-stage Dockerfiles for backend and frontend, Nginx reverse proxy configuration, seed data script (8 MCU movies + 4 cinemas), and root docker-compose.yml | Reviewed container orchestration, port bindings, healthchecks, seed script, and approved Task 11 spec |
| 12. Final README & documentation | Authored comprehensive root README.md with Mermaid ER diagram, algorithm purity explanation, API reference table, decisions, run instructions, and AI disclosure | Verified all SPEC requirements, Mermaid syntax, and approved Task 12 spec |
