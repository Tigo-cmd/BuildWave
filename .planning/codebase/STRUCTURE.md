# Directory Layout & Structure

*Mapped on: 2026-08-04*

```
BuildWave/
├── .planning/               # Project planning, state, and codebase maps
│   └── codebase/            # Codebase mapping documents
├── public/                  # Static assets and favicon
├── src/
│   ├── components/          # Feature and layout components
│   │   ├── ui/              # Reusable Radix/Shadcn primitives
│   │   ├── AuthModal.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── ProjectRequestModal.tsx
│   │   ├── ProtectedAdminRoute.tsx
│   │   ├── TrackProjectModal.tsx
│   │   └── Whatsappchat.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useInactivityTimer.ts
│   │   └── useRateLimit.ts
│   ├── integrations/        # External services integration
│   │   └── firebase/
│   │       ├── config.ts
│   │       ├── firebaseService.ts
│   │       └── useFirebaseAuth.ts
│   ├── lib/                 # Shared utilities and security core
│   │   ├── security.ts
│   │   ├── rateLimiter.ts
│   │   ├── utils.ts
│   │   └── __tests__/
│   │       ├── rateLimiter.test.ts
│   │       └── security.test.ts
│   ├── pages/               # Page view components
│   │   ├── Admin.tsx
│   │   ├── AdminLogin.tsx
│   │   ├── AdminProjectDetail.tsx
│   │   ├── AdminTestimonials.tsx
│   │   ├── AdminUsers.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Index.tsx
│   │   ├── NotFound.tsx
│   │   ├── Topics.tsx
│   │   └── TrackProject.tsx
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── CLAUDE.md                # Project guidelines & protocol
├── FIRESTORE_SECURITY_RULES.md # Authoritative database rules reference
├── index.html               # Entry HTML document with CSP meta tags
├── package.json             # NPM dependencies and scripts
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript base configuration
└── vite.config.ts           # Vite configuration & path aliases
```
