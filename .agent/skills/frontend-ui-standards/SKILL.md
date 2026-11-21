---
name: frontend-ui-standards
description: Standards and guidelines for the Vite + React frontend using simple, modern, responsive Tailwind CSS. Use for tasks 8, 9, 10 or anytime working on frontend views, components, and layout.
---

# Frontend UI Standards (Tailwind CSS)

## 1. Principles
- **Simple, Modern, Clean**: Minimalist aesthetic with subtle borders, smooth transitions, legible typography, and tasteful badge/card accents.
- **Mobile-First & Responsive**: Every view must adapt cleanly across screen widths (`sm:`, `md:`, `lg:` breakpoints).
- **Accessible & Clear Feedback**: Form inputs have focus rings (`focus:ring-2 focus:ring-indigo-500`), error states stand out (`text-rose-600 bg-rose-50 border-rose-200`), and interactive elements have hover/active indicators.

## 2. Color Palette & Theming
- **Backgrounds**: Slate / neutral backgrounds (`bg-slate-50` or `bg-zinc-900` for modern contrast).
- **Cards & Surfaces**: Clean white `bg-white` (or dark equivalents) with subtle borders (`border border-slate-200`) and soft shadows (`shadow-sm hover:shadow-md transition-shadow`).
- **Primary / Action Color**: Indigo or Blue (`bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg`).
- **Status Accents**:
  - Watched / Success: Emerald (`bg-emerald-50 text-emerald-700 border-emerald-200`)
  - Warning / Prerequisite: Amber / Violet badges
  - Danger / Cycle / Error: Rose (`bg-rose-50 text-rose-700 border-rose-200`)

## 3. Key Layouts & Components
- **Top Navigation / Shell**: Sticky header with brand title, responsive navigation links (Movies, Rewatch Plan, Seat Booking).
- **Movies View**:
  - Responsive grid / table of movies with release year and runtime badges.
  - Interactive "Watched" toggle button / checkbox.
  - Modal or inline card for adding/editing movies and selecting prerequisites.
- **Rewatch Plan View**:
  - Target movie selector (dropdown or searchable combo).
  - Progress bar showing watched count vs. total prerequisites (`4 of 7 watched`) with percentage fill.
  - Badge showing `remainingRuntime` in hours and minutes.
  - Sequential ordered list of prerequisites showing topological order.
- **Booking View**:
  - Cinema selector and group size number input.
  - Responsive results display:
    - Feasible: total bundles count, visual breakdown chips (e.g. `20 x 1`, `9 x 2`, `6 x 1`).
    - Infeasible: clear alert banner explaining "Not possible to seat exact group with available bundle sizes".

## 4. Quality Checklist
- [ ] No layout overflow or horizontal scrollbar on small screens (`320px+`).
- [ ] Meaningful empty states when no movies or cinemas exist.
- [ ] Loading spinners / disabled buttons during API calls.
- [ ] Error messages display the backend error shape `{ error: { code, message } }`.
