# Decisions and assumptions (copy into README)

1. No authentication or roles (not in the assessment). All endpoints are public; `watched` is one global flag per movie.
2. Booking returns a quote only; nothing is persisted, no payments or reservations.
3. `POST /movies` accepts one movie per request. Prerequisites are referenced by movie id.
4. `PATCH /movies/:id` is partial. If `prerequisites` is present it REPLACES the whole list.
5. Duplicate movie title or cinema name (case-insensitive) => `409 DUPLICATE_TITLE` / `409 DUPLICATE_NAME`.
6. Unknown prerequisite id => `400 INVALID_PREREQUISITE`. Duplicate ids in a list are rejected with 400.
7. Bundle sizes must be distinct integers (1-10 of them, each 1-500); duplicates => 400. Stored sorted ascending.
8. Release year must be an integer between 1888 and 2100.
9. When several optimal bundle combinations exist, any one is returned (response sorted by size descending).
10. Rewatch order: any valid topological order is acceptable; ours is deterministic.
11. `groupSize` missing / non-integer / outside 1-10000 => 400.
12. Seed data: the 8 sample MCU movies from the assessment (sample data, not an official guide) plus 2-3 sample cinemas.
13. Frontend styling: simple, modern, responsive UI built with Tailwind CSS (mobile-first, clean cards/badges, accessible forms, clear status alerts).
