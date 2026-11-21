# Plan

## Stack
Backend: Node 20, Express, TypeScript (strict), PostgreSQL via `pg` (plain SQL migrations), Vitest + Supertest,
`swagger-ui-express` + `yaml`. Frontend: Vite + React + TypeScript + Tailwind CSS (responsive, modern UI) + react-router. Docker Compose: db, api, web.

## Backend layers
`routes` (HTTP) -> `validators` (input) -> `services` (DB + algorithms) -> `algorithms` (pure).
`middleware/errorHandler` maps `AppError(code,status,message)` to the error shape.
`src/docs/openapi.yaml` is served at `/api/docs`.

## Schema
movies(id serial pk, title text, release_year int, runtime int check 1..300, watched bool default false)
movie_prerequisites(movie_id fk, prerequisite_id fk, pk(movie_id,prerequisite_id), check movie_id<>prerequisite_id)
cinemas(id serial pk, name text)
cinema_bundles(cinema_id fk, size int check 1..500, pk(cinema_id,size))
Case-insensitive uniqueness: unique index on lower(title) / lower(name).

## PATCH prerequisites flow
load graph -> `wouldCreateCycle` -> 409 if cycle -> otherwise replace edges in one transaction.

## Testing
Unit (algorithms from SPEC examples), integration (Supertest), docs drift test.

## Frontend views
Movies, Rewatch Plan (`GET /movies/:id/rewatch-order`), Booking (`GET /cinemas/:id/booking`). Typed API client in `src/api/`.
