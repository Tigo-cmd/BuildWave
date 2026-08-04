# Testing Strategy & Structure

*Mapped on: 2026-08-04*

## Test Runner & Environment
- **Runner:** Node.js Native Test Runner (`node:test` + `node:assert`)
- **TS Execution:** `tsx` (`npx tsx --test`)
- **Execution Script:** `npm run test`

## Test Location & Structure
- Unit tests are located in `src/lib/__tests__/`:
  - `src/lib/__tests__/rateLimiter.test.ts` — Tests window calculation, attempt consumption, blocking, and reset.
  - `src/lib/__tests__/security.test.ts` — Tests HTML escaping (XSS), object sanitization, email validation, and password policy rules.

## Test Guidelines
- Unit tests must run natively without heavy browser overhead.
- Browser storage APIs (like `localStorage`) are mocked in test setup if running under Node.js runtime.
- New security utilities or helpers added to `src/lib/` must include corresponding tests under `src/lib/__tests__/`.
