# Technical Debt & Known Concerns

*Mapped on: 2026-08-04*

## Technical Debt & Areas of Improvement
1. **Client-Side vs Backend Enforcement:**
   - Client-side rate limiting (`rateLimiter.ts`) and sanitization (`security.ts`) protect the browser UI, but backend Firebase Cloud Functions (if implemented in the future) should replicate these checks to ensure direct API calls cannot bypass client gates.
2. **Local Storage Session State:**
   - Session identifiers (`buildwave_uid`, `buildwave_user`) are stored in `localStorage`. Ensure no plain-text passwords or secret credentials are ever written to `localStorage`.
3. **Firestore Security Rules Synchronization:**
   - Rules documented in `FIRESTORE_SECURITY_RULES.md` must remain in sync with deployed Firebase Console security rules.
4. **Component Test Coverage:**
   - Core utility logic is tested via `npm run test`, but React UI component rendering tests (e.g. testing `AuthModal.tsx` or `ProjectRequestModal.tsx` directly with React Testing Library) are not yet set up.
