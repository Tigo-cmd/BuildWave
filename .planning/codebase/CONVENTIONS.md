# Code Conventions & Design Patterns

*Mapped on: 2026-08-04*

## Code Style & Naming Conventions
- **Component Naming:** PascalCase for React components (`AuthModal.tsx`, `AdminLogin.tsx`).
- **Hook Naming:** camelCase starting with `use` (`useFirebaseAuth.ts`, `useRateLimit.ts`, `useInactivityTimer.ts`).
- **Utility Naming:** camelCase for helper files (`security.ts`, `rateLimiter.ts`).
- **Path Aliases:** Prefixed with `@/` mapping to `src/` (configured in `vite.config.ts` and `tsconfig.json`).

## Security & Defense Patterns
- **Input Sanitization:** All user-supplied inputs must pass through `sanitizeInput()` or `sanitizeObject()` from `@/lib/security` before processing or storing in Firestore.
- **Rate Limiting:** Action attempts on auth or submission forms must consume rate limit windows via `useRateLimit()` or `rateLimiter.consume()`.
- **Password Complexity:** Passwords must be validated via `validatePassword()`, enforcing length and character diversity.
- **Session Protection:** Protected screens consume `useInactivityTimer()` to clear `localStorage` sessions on idle timeout.

## UI & Theme Conventions
- Tailwind utility classes combined using `cn(...)` from `@/lib/utils`.
- Custom CSS utility classes in `src/index.css` (`gradient-text`, `btn-hero`, `glass-card`).
