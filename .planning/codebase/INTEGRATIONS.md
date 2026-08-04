# External Integrations & Services

*Mapped on: 2026-08-04*

## Firebase Infrastructure (`src/integrations/firebase/`)
- **Authentication:** `src/integrations/firebase/useFirebaseAuth.ts`
  - Email/Password sign-up and login.
  - State listener `onAuthStateChanged`.
  - Session state persistence in `localStorage` (`buildwave_uid`, `buildwave_user`, `buildwave_email`).
- **Cloud Firestore:** `src/integrations/firebase/firebaseService.ts`
  - User profiles collection (`users`)
  - Projects collection (`projects`)
  - Testimonials collection (`testimonials`)
  - Access control rules enforced via `FIRESTORE_SECURITY_RULES.md` (`isAdmin`, `isAuth`).
- **Firebase Storage:** `src/integrations/firebase/config.ts`
  - File attachments uploaded under `projects/{projectId}/files/`.

## External Communication & Support
- **WhatsApp Integration:** `src/components/Whatsappchat.tsx`
  - Floating direct link component for student support inquiries.

## Security & Gateways
- **Browser Security Policy:** CSP meta tags in `index.html` allowing connection to Firebase endpoints (`*.firebaseio.com`, `*.googleapis.com`, `identitytoolkit.googleapis.com`).
- **Client-Side Security:**
  - Rate limiting utility (`src/lib/rateLimiter.ts`) enforcing sliding-window rate limits on auth and submission flows.
  - XSS sanitization (`src/lib/security.ts`).
