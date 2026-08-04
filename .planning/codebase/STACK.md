# Technology Stack & Dependencies

*Mapped on: 2026-08-04*

## Core Framework & Runtime
- **Frontend Framework:** React 18 (`react`, `react-dom`)
- **Build Tool / Bundler:** Vite (`vite`, `@vitejs/plugin-react-swc`)
- **Language:** TypeScript 5 (`typescript`)
- **Routing:** React Router DOM v6 (`react-router-dom`)
- **State & Data Fetching:** `@tanstack/react-query`

## UI & Styling
- **Design System / Component Library:** Radix UI primitives (`@radix-ui/react-*`), Lucide Icons (`lucide-react`)
- **CSS Engine:** Vanilla CSS + Tailwind CSS (`tailwindcss`, `autoprefixer`, `postcss`, `tailwind-merge`, `clsx`)
- **Animations:** Framer Motion (`framer-motion`)
- **Forms:** React Hook Form (`react-hook-form`), Zod (`zod`), `@hookform/resolvers`

## Backend & Services
- **BaaS Provider:** Firebase v10 (`firebase`)
  - Authentication (Firebase Auth)
  - Firestore Database (`firebase/firestore`)
  - Cloud Storage (`firebase/storage`)
- **Meta / Head Management:** React Helmet Async (`react-helmet-async`)

## Development & Testing
- **Linter / Formatter:** ESLint (`eslint`, `typescript-eslint`)
- **Test Runner:** Node.js Native Test Runner with `tsx` (`npx tsx --test`)
- **Package Manager / Lockfile:** Bun (`bun.lockb`) & npm (`package.json`)

## Configuration Files
- `vite.config.ts` — Vite build and alias (`@` -> `./src`) configuration
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — TypeScript compiler options
- `tailwind.config.ts` — Tailwind design tokens and plugin setups
- `index.html` — Application HTML shell with security CSP headers
