# Task 09: Add Movies View with Prerequisites and Watched Toggle

## Goal
Implement the interactive Movies management view in `frontend/src/pages/MoviesPage.tsx` and supporting components. Users can view the catalog of MCU movies, quickly toggle their watched state, add new movies with prerequisites, and edit existing movie prerequisites with real-time feedback and cycle-prevention error handling.

## Scope
- In:
  - Interactive movie list and cards in `frontend/src/pages/MoviesPage.tsx`:
    - Displays movie title, release year badge, runtime badge (formatted as `Xh Ym` / `Z min`), watched badge/checkbox, and prerequisite tags.
    - Interactive "Watched" toggle: clicking updates status via `patchMovie(id, { watched })` with optimistic update and rollback on error.
  - Add Movie Modal (`frontend/src/components/AddMovieModal.tsx`):
    - Form inputs: `title`, `releaseYear` (1888–2100), `runtime` (1–300), and prerequisites multi-select checklist.
    - Submits to `createMovie(input)`.
    - Displays field validations and backend error banners (`409 DUPLICATE_TITLE`, `400 VALIDATION_ERROR`).
  - Edit Prerequisites Modal (`frontend/src/components/EditPrerequisitesModal.tsx`):
    - Allows replacing the prerequisite list for any movie.
    - Disallows self-selection.
    - Submits to `patchMovie(id, { prerequisites: selectedIds })`.
    - Catches and displays `409 CIRCULAR_DEPENDENCY` errors prominently in a danger alert banner (`"Setting this prerequisite would create a cyclic dependency"`).
  - Empty State & Loading States:
    - Modern animated skeleton or spinner while loading.
    - Clear empty state when no movies exist.
  - Responsive Tailwind CSS design conforming to `frontend-ui-standards`.
- Out:
  - Rewatch plan calculation view (reserved for Task 10).
  - Seat booking view (reserved for Task 10).

## Files (created/changed)
- `docs/specs/09-movies-view.md` (this spec)
- `frontend/src/components/AddMovieModal.tsx` (new)
- `frontend/src/components/EditPrerequisitesModal.tsx` (new)
- `frontend/src/components/MovieCard.tsx` (new)
- `frontend/src/pages/MoviesPage.tsx` (updated with full UI and state management)
- `docs/TASKS.md`
- `docs/AI_USAGE.md`

## Behavior
### 1. Movie Browsing & Watched Toggle
- On mount, fetches movies from `GET /api/movies`.
- Each movie displays title, year, runtime, watched indicator, and a list of its direct prerequisite movie titles.
- Clicking the watched toggle immediately updates local state and sends `PATCH /api/movies/:id { watched }`. If the request fails, rolls back and displays an error toast/banner.

### 2. Adding a Movie
- Clicking "+ Add Movie" opens modal.
- User enters title, release year, runtime, and optionally checks prerequisites from existing movies.
- Client validates inputs before submission.
- On backend 409 (`DUPLICATE_TITLE`), shows: "A movie with this title already exists".
- On success, adds movie to list and closes modal.

### 3. Editing Prerequisites & Circular Dependency Feedback
- Clicking "Edit Prerequisites" opens modal with a checklist of other movies.
- The current movie is excluded from its own checklist (cannot be its own prerequisite).
- Submitting sends `PATCH /api/movies/:id { prerequisites: selectedIds }`.
- If the backend returns `409 CIRCULAR_DEPENDENCY`, the modal remains open and highlights the error: `"Setting this prerequisite would create a cyclic dependency"`.
- On success, updates the movie's prerequisites in the UI and closes modal.

## Acceptance Criteria
- [x] Movies list displays all movies fetched from `/api/movies` with year, runtime, watched status, and prerequisite titles.
- [x] Watched toggle updates movie status via `PATCH /api/movies/:id` and updates UI reactively.
- [x] Add Movie modal allows creating movies with optional prerequisites and catches duplicate titles (`409 DUPLICATE_TITLE`).
- [x] Edit Prerequisites modal allows replacing prerequisites and catches cycles (`409 CIRCULAR_DEPENDENCY`) with clear user alert.
- [x] Responsive Tailwind styling functions on mobile, tablet, and desktop (`frontend-ui-standards`).
- [x] Typecheck passes with 0 errors (`pnpm tsc --noEmit`).
- [x] Production build succeeds (`pnpm run build`).
- [x] Clean commit created with exact message: `feat(frontend): add movies view with prerequisites and watched toggle`.
