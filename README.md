# PeakEaze — Invoice Management System

A production-ready invoice management SPA built with React 18, TypeScript, and MUI v5. Features JWT authentication with auto-refresh, fine-grained role-based access control, full invoice CRUD, and enforced test coverage thresholds.

**Live Demo:** [https://frontend-starter-peakeaze.vercel.app](https://frontend-starter-peakeaze.vercel.app)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Architecture Decisions](#architecture-decisions)
- [Role-Based Access Control](#role-based-access-control)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript 5 (strict mode) |
| UI Library | MUI v5 (Material UI) |
| Routing | React Router v6 |
| Build Tool | Vite 5 |
| Testing | Vitest + Testing Library |
| Linting | ESLint (airbnb config) + Prettier |
| Package Manager | pnpm |
| Deployment | Vercel |

---

## Features

### Authentication
- JWT Bearer token authentication stored in `localStorage`
- **Transparent token auto-refresh** — on any 401 response, a refresh is attempted once and the original request is retried seamlessly
- Session rehydration via `GET /api/auth/me` on app load — no stale sessions
- Post-login redirect to the originally requested route via `state.from`
- Protected routes via `<RequireAuth>` wrapper component

### Invoice Management
- **List** with server-side search (by customer name), status filter, and pagination
- **Create** invoice via a modal dialog form
- **View** full invoice detail on a dedicated page
- **Edit** customer name, amount, and status inline on the detail page
- **Delete** with Admin-only access enforcement
- **Status workflow** — strict transitions enforced at the UI layer:
  - `Draft` → `Sent` → `Paid` (terminal; no further transitions)

### UI / UX
- Fully responsive — table layout on desktop, card layout on mobile
- Skeleton loading states while data fetches
- Empty state with contextual illustration
- Dark mode with `localStorage` persistence
- Stats row with live-computed page totals
- Client-side secondary sort: primary by status priority, secondary by `createdAt` descending

### Resilience
- API response normalizer handles **3 different backend payload shapes** and multiple field name variants (`customerName` / `customer_name` / `customer`)
- `ApiError` class carries HTTP status + parsed response body for precise error handling
- Effect cleanup via cancellation flags — no state updates on unmounted components

---

## Project Structure

```
src/
├── api/
│   ├── http.ts              # Base fetch wrapper, ApiError, auto-refresh logic
│   ├── authApi.ts           # login / signup / me endpoints
│   ├── invoicesApi.ts       # Invoice CRUD endpoints + TypeScript types
│   └── normalizers.ts       # Robust response shape normalizer
├── auth/
│   └── AuthContext.tsx      # JWT state, login/logout, role extraction
├── rbac/
│   ├── roles.ts             # Role union type
│   └── invoicePermissions.ts # Permission functions + status transition guards
├── validation/
│   └── validators.ts        # Pure function validators (email, password, money)
├── components/
│   ├── InvoiceTable.tsx     # Desktop table view (memo)
│   ├── InvoiceCards.tsx     # Mobile card view (memo)
│   ├── InvoiceFormDialog.tsx # Create/edit modal
│   ├── Pagination.tsx       # Reusable pagination controls
│   └── RequireAuth.tsx      # Route guard component
├── pages/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── InvoicesPage.tsx     # List page with filters and stats
│   └── InvoiceDetailsPage.tsx
├── context/
│   └── ThemeContext.tsx     # Dark/light mode provider
├── __tests__/               # 7 test files, ≥90% coverage enforced
├── Root.tsx                 # App shell + Navbar
├── App.tsx                  # Route definitions
└── theme.ts                 # MUI theme customization
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd frontend-starter-peakeaze

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`. All `/api` calls are proxied to the backend automatically — no CORS setup needed.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `""` (same origin) | Override backend base URL for non-Vercel deployments |

Create a `.env.local` file in the project root:

```bash
VITE_API_BASE_URL=https://your-backend.example.com
```

---

## Available Scripts

```bash
pnpm dev          # Start Vite dev server with HMR
pnpm build        # Type-check + production build
pnpm preview      # Preview the production build locally
pnpm test         # Run all tests once
pnpm test:watch   # Run tests in watch mode
pnpm lint         # ESLint with zero-warning policy
pnpm lint:fix     # ESLint with auto-fix
pnpm format       # Prettier write
pnpm format:check # Prettier check (used in CI)
pnpm commit       # Commitizen interactive commit prompt
```

---

## Architecture Decisions

### Why pure function validators instead of a library (Zod/Yup)?
The validation requirements are simple and stable. A library would add ~15KB to the bundle for functionality that takes ~30 lines to write and test directly.

### Why manual `cancelled` flags instead of AbortController?
Both achieve the same result. The `cancelled` pattern avoids the `DOMException` branch in the catch block, keeping error handling simpler.

### Why normalizers instead of backend contract enforcement?
The normalizer layer (`normalizers.ts`) decouples the frontend from backend API shape instability. It handles 3 known shapes and field name variants, making the app resilient to backend changes without touching business logic.

### Component memoization strategy
`InvoiceTable` and `InvoiceCards` are wrapped in `React.memo` because they receive new array references on every parent render. `sortedInvoices` is memoized with `useMemo` and `onViewInvoice` with `useCallback` to keep those memo boundaries effective.

---

## Role-Based Access Control

Permissions are pure functions in `src/rbac/invoicePermissions.ts`, making them trivially testable.

| Permission | Admin | Accountant | Viewer |
|---|:---:|:---:|:---:|
| View invoices | ✅ | ✅ | ✅ |
| Create invoice | ✅ | ✅ | ❌ |
| Edit invoice | ✅ | ✅ | ❌ |
| Delete invoice | ✅ | ❌ | ❌ |
| Change status | ✅ | ✅ | ❌ |

**Status transitions** are enforced before any API call via `isAllowedStatusChange(currentStatus, newStatus)`:

```
Draft ──► Sent ──► Paid (terminal)
```

---

## Testing

Tests are written with **Vitest** and **Testing Library**. Coverage is enforced via Vite config — the build will fail if thresholds drop below **90% on all axes** (lines, branches, functions, statements).

```bash
pnpm test                          # Run once
pnpm test:watch                    # Watch mode
pnpm vitest run --coverage         # With coverage report
```

### Test Coverage

| File | What's tested |
|---|---|
| `invoicePermissions.test.ts` | All RBAC functions for every role × permission combination |
| `normalizers.test.ts` | All 3 response shapes, malformed entries, timestamp coercion |
| `validators.test.ts` | Email, password, customer name, money parser |
| `InvoicesPage.test.tsx` | Role-based UI rendering, empty state, filter integration |
| `LoginPage.test.tsx` | Field rendering, validation error display, form submission |
| `Root.test.tsx` | App shell mounting, navbar visibility |
| `main.test.tsx` | Entry point smoke test |

---

## Deployment

The app is deployed to **Vercel** with two routing rules in `vercel.json`:

1. `/api/:path*` → reverse-proxied to the backend (`https://backend-starter-nu.vercel.app/api/:path*`) — eliminates CORS entirely
2. `/*` → serves `index.html` — enables client-side React Router navigation on direct URL access

### Deploy your own

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

No additional environment variables are required when deploying to Vercel as the proxy handles all API routing.

---

## Code Quality

- **ESLint** with `airbnb` + `airbnb-typescript` ruleset — zero warnings allowed (`--max-warnings 0`)
- **Prettier** for consistent formatting
- **lint-staged** + **Husky** runs lint + format on every commit
- **Commitizen** enforces conventional commit messages (`feat:`, `fix:`, `chore:`, etc.)
- **TypeScript strict mode** — no implicit `any`, strict null checks enabled

