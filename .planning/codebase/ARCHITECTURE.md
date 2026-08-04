# Architecture & System Design

*Mapped on: 2026-08-04*

## Application Overview
BuildWave is an academic project assistance platform connecting undergraduate and postgraduate students with academic project execution resources, progress tracking, and administrative review.

## Layered Architecture

```
[ Presentation Layer: React Pages & Components ]
       │
       ├──► Hooks Layer (useFirebaseAuth, useRateLimit, useInactivityTimer)
       │
       ├──► Utility & Security Layer (security.ts, rateLimiter.ts)
       │
       └──► Data / BaaS Layer (Firebase Auth, Cloud Firestore, Cloud Storage)
```

## Key Application Entry Points
- `src/main.tsx` — Mounts React DOM root and sets up `HelmetProvider`.
- `src/App.tsx` — Sets up React Router (`BrowserRouter`), `QueryClientProvider`, `Toaster` notifications, and route definitions.

## Route Topography
- `/` — Landing Page (`src/pages/Index.tsx`)
- `/dashboard` — Student Dashboard (`src/pages/Dashboard.tsx`)
- `/track/:id` — Public/Student Project Tracking (`src/pages/TrackProject.tsx`)
- `/topics` — Academic Topics Catalog (`src/pages/Topics.tsx`)
- `/admin/login` — Administrator Login (`src/pages/AdminLogin.tsx`)
- `/admin` — Protected Admin Overview (`src/components/ProtectedAdminRoute.tsx` -> `src/pages/Admin.tsx`)
- `/admin/project/:id` — Protected Admin Project Inspector (`src/pages/AdminProjectDetail.tsx`)
- `/admin/users` — Protected User Management (`src/pages/AdminUsers.tsx`)
- `/admin/testimonials` — Protected Testimonial Management (`src/pages/AdminTestimonials.tsx`)

## Protection & Guard Patterns
- `ProtectedAdminRoute` checks `isAdmin` status in Firestore user profile or checks stored `buildwave_uid` before granting access to `/admin/*` routes.
