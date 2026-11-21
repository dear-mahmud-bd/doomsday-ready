# Task 10: Add Rewatch Plan and Booking Views

## Goal
Implement the interactive Rewatch Planner view in `frontend/src/pages/RewatchPage.tsx` and Opening Night Seat Booking view in `frontend/src/pages/BookingPage.tsx`, connecting to the backend rewatch ordering and DP bundle calculation endpoints.

## Scope
- In:
  - Rewatch Plan View (`frontend/src/pages/RewatchPage.tsx`):
    - Target movie selector (interactive dropdown with release year badges).
    - Rewatch order list: sequentially numbered topological viewing plan.
    - Watched progress bar: visual percentage bar displaying `X of Y watched (Z%)`.
    - Remaining watch time calculation card (`Xh Ym` / total minutes of unwatched prerequisites).
    - Interactive watched toggle directly within the rewatch plan list (syncs with `patchMovie`).
    - Clean empty state when target has no prerequisites (e.g. *Thor: Ragnarok*).
  - Seat Booking View (`frontend/src/pages/BookingPage.tsx`):
    - Cinema selector fetching registered cinemas from `/api/cinemas`.
    - Add Cinema modal (`frontend/src/components/AddCinemaModal.tsx`) allowing users to register new cinemas with custom bundle sizes.
    - Group size input (1 to 10,000) with preset buttons (`6`, `7`, `11`, `44`).
    - Real-time or button-triggered booking quote fetch from `/api/cinemas/:id/booking?groupSize=X`.
    - Feasible quote display: total bundles count, visual breakdown chips (e.g. `20 x 1`, `9 x 2`, `6 x 1`), and exact seat count verification.
    - Infeasible quote display: clear alert banner explaining "Not possible to seat exact group with available bundle sizes".
  - Responsive Tailwind CSS design (`frontend-ui-standards`).
- Out:
  - Docker Compose setup (reserved for Task 11).

## Files (created/changed)
- `docs/specs/10-rewatch-and-booking-views.md` (this spec)
- `frontend/src/components/AddCinemaModal.tsx` (new)
- `frontend/src/pages/RewatchPage.tsx` (updated with full planner implementation)
- `frontend/src/pages/BookingPage.tsx` (updated with full booking quote implementation)
- `docs/TASKS.md`
- `docs/AI_USAGE.md`

## Behavior
### 1. Rewatch Plan
- User selects a target movie from dropdown.
- App fetches `GET /api/movies/:id/rewatch-order`.
- Displays progress bar (e.g., `4 of 7 watched`), remaining runtime (e.g., `6h 30m`), and ordered prerequisite cards.
- Clicking the watched toggle on a movie in the list updates the movie's status and refreshes progress and remaining time metrics.

### 2. Booking Quote
- User picks a cinema (or creates one with distinct bundle sizes).
- User enters group size (1–10,000).
- Submitting fetches `GET /api/cinemas/:id/booking?groupSize=X`.
- If `possible: true`, displays total bundle count badge, breakdown chips (e.g., `5 x 1`, `2 x 3`), and seat sum verification.
- If `possible: false`, displays a red alert banner saying "Not possible to form exact group size".

## Acceptance Criteria
- [x] Rewatch page allows selecting any target movie and displays topological prerequisite order.
- [x] Progress bar accurately reflects `watchedCount` vs `total` with percentage indicator.
- [x] Remaining watch time shows sum of unwatched prerequisites in hours and minutes.
- [x] Watched toggling within rewatch order updates server and recalculates remaining metrics.
- [x] Booking page allows choosing a cinema and entering group size 1–10,000.
- [x] Add Cinema modal allows registering new cinemas with validated bundle sizes.
- [x] Feasible booking quotes show total bundles and individual size counts.
- [x] Infeasible booking quotes clearly display "Not possible".
- [x] Responsive Tailwind styling functions on mobile, tablet, and desktop (`frontend-ui-standards`).
- [x] Typecheck passes with 0 errors (`pnpm tsc --noEmit`).
- [x] Production build succeeds (`pnpm run build`).
- [x] Clean commit created with exact message: `feat(frontend): add rewatch plan and booking views`.
