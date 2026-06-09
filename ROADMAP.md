# Full-Stack To-Do App — Learning Roadmap

> Stack: Node.js (Express) + React, TypeScript end-to-end. Goal: a feature-rich
> app that doubles as a senior-level full-stack learning vehicle.
>
> **Legend:** `[Core]` = backbone, do these. `[Stretch]` = add once core works;
> this is where the deep learning happens. Don't add a tool until you've felt the
> pain it solves.

---

## Section 0 — Guiding Principles
- **Vertical slices, not horizontal layers.** Build one feature end-to-end
  (DB → API → UI) before starting the next.
- **Make it work → make it right → make it fast.**
- **Commit often, small PRs to yourself.** Practice git hygiene.
- **Read the docs, not just tutorials.**

---

## Section 1 — Architecture & Repository Structure
- **[Core] Monorepo** with pnpm workspaces. Layout: `apps/api`, `apps/web`,
  `packages/`.
- **[Core] Shared types package** — define domain types & API contracts once,
  import in both ends. The whole reason to use TS on both sides.
- **[Stretch] Turborepo / Nx** for build orchestration & caching.
- Concepts: monorepo vs polyrepo, dependency hoisting, contract layer prevents drift.

## Section 2 — Tooling & Dev Environment
- **[Core] TypeScript** strict mode (`strict`, `noUncheckedIndexedAccess`).
- **[Core] ESLint + Prettier** (linting vs formatting).
- **[Core] Vite** for the React app.
- **[Core] env validation** with Zod — fail fast on misconfig.
- **[Stretch] Husky + lint-staged + commitlint.**
- **[Stretch] Docker + Docker Compose** — start with a Postgres container.

## Section 3 — Database & Data Layer
- **[Core] PostgreSQL** via Docker. Learn schemas, indexes, FKs, transactions, EXPLAIN.
- **[Core] Prisma** ORM + migrations (never edit DB by hand).
- **[Stretch] Drizzle ORM** on a branch to compare.
- **[Stretch] Redis** for cache / sessions / queues.
- Model: Users, Tasks, Subtasks, Projects/Lists, Tags (m2m), Comments,
  Attachments, Activity log.

## Section 4 — Backend (Express + TypeScript)
- **[Core]** Layered architecture: routes → controllers → services → repositories.
- **[Core] Zod** request validation at the boundary (derive types from schemas).
- **[Core]** Centralized error handling + custom error classes.
- **[Core] Pino** structured logging + request correlation IDs.
- **[Core]** REST design: status codes, pagination (cursor vs offset), filter/sort.
- **[Stretch] OpenAPI/Swagger** self-documenting API.
- **[Stretch] GraphQL (Apollo)** and **tRPC** on branches to compare.

## Section 5 — Auth, Authorization & Security
- **[Core]** Password hashing (argon2/bcrypt).
- **[Core] JWT access + refresh token rotation** (refresh in httpOnly cookie).
- **[Core] RBAC** (owner vs collaborator).
- **[Core]** Helmet, CORS (learn it properly), rate limiting, sanitization.
- **[Stretch] OAuth 2.0** social login (Passport/Auth.js).
- **[Stretch]** Email verification + password reset (signed expiring tokens).
- **[Stretch] 2FA (TOTP).**
- Concepts: OWASP Top 10, XSS vs CSRF, secret management.

## Section 6 — Frontend (React + TypeScript)
- **[Core] React 18** hooks; rules of hooks; effect deps.
- **[Core] React Router** with protected routes & code splitting.
- **[Core] TanStack Query** for all server state (master this).
- **[Core] Zustand** for UI-only client state.
- **[Core] React Hook Form + Zod resolver** (reuse shared schemas).
- **[Stretch] Redux Toolkit** on a branch to compare.

## Section 7 — UI, Styling & Design System
- **[Core] Tailwind CSS.**
- **[Core] shadcn/ui** (Radix-based, you own the code).
- **[Core] Accessibility** — keyboard nav, ARIA, focus management.
- **[Stretch] Storybook**, **Framer Motion**, dark mode, i18n (react-i18next).

## Section 8 — Feature Set (build as vertical slices)
- Foundational: auth/profile, Tasks CRUD, Lists/Projects, due dates/priority/notes.
- Intermediate: tags (m2m) + filtering, search/sort/saved views, subtasks,
  drag-and-drop (dnd-kit), List/Kanban/Calendar views, recurring tasks (RRULE).
- Advanced: sharing + RBAC, comments/activity, file attachments (S3/MinIO via
  presigned URLs), notifications (in-app/email/web push), real-time sync.
- Polish: PWA/offline, audit log, analytics dashboard (Recharts), bulk actions,
  undo, command palette.

## Section 9 — Real-Time, Background Jobs & Async
- **[Stretch] Socket.IO** live collaboration (rooms, socket auth, reconnection).
- **[Stretch] BullMQ** (Redis) for emails, recurring-task generation, reminders.
- **[Stretch]** Scheduled/cron jobs for reminders & digests.
- Concepts: eventual consistency, at-least-once delivery, idempotency, WS/SSE/polling.

## Section 10 — Testing
- **[Core] Vitest/Jest** unit tests.
- **[Core] Supertest** API integration tests vs throwaway Postgres.
- **[Core] React Testing Library** (test behavior).
- **[Stretch] Playwright** E2E; **MSW** to mock APIs.
- Concepts: test pyramid, fixtures/factories, isolation, coverage as guide.

## Section 11 — Observability & Performance
- **[Stretch]** Pino structured logging w/ request IDs.
- **[Stretch] Sentry** error tracking (FE + BE).
- **[Stretch]** OpenTelemetry basics / APM.
- **[Stretch]** Redis caching, DB indexing, React profiling, bundle analysis, Lighthouse.

## Section 12 — DevOps, CI/CD & Deployment
- **[Core]** Git + GitHub, branch protection, PR workflow.
- **[Core] GitHub Actions** CI: lint → typecheck → test → build.
- **[Core]** Dockerize both apps (multi-stage builds).
- **[Core]** Deploy: FE → Vercel/Netlify; BE+DB → Railway/Render/Fly.io.
- **[Stretch]** Terraform + AWS; CD with staging→prod promotion & migration steps.
- Concepts: 12-factor app, secrets in CI, zero-downtime deploys, rollbacks.

## Section 13 — Documentation
- Real README, Architecture Decision Records (ADRs), Swagger API docs, dev guide.

---

## Schedule (~10–15 hrs/week; depth beats speed)

| Phase | Weeks | Focus | Done when… |
|---|---|---|---|
| 0. Foundations | 1 | Monorepo, TS, ESLint/Prettier, Docker Postgres, shared types, hello-world FE+BE | One typed value flows DB→API→UI |
| 1. Core CRUD | 2–3 | Prisma schema+migrations, Tasks/Lists CRUD, layered backend, TanStack Query, Tailwind | Manage tasks end-to-end |
| 2. Auth | 2 | Password auth, JWT+refresh, protected routes, RBAC, security middleware | Real users with real sessions |
| 3. Rich features | 3–4 | Tags, search/filter/sort, subtasks, DnD, Kanban+Calendar, RHF+Zod | Feels like a real product |
| 4. Testing + CI | 2 | Unit/integration/component tests, GitHub Actions, Playwright basics | Green CI on every PR |
| 5. Collab & async | 3 | Sharing/permissions, comments, uploads (S3/MinIO), WebSockets, BullMQ, email | Two users collaborate live |
| 6. Production polish | 2–3 | Docker deploy, Sentry, Redis cache, PWA/offline, dark mode/i18n, analytics | Live & monitored |
| 7. Stretch & compare | ongoing | tRPC/GraphQL, Drizzle, Redux, Storybook, Terraform/AWS, OTel | Can argue trade-offs |

**Core path: ~12–16 weeks.**

---

## Working agreement
Teaching mode: concepts and guidance, **no code handed over** unless explicitly
requested. Claude reviews *your* code, unblocks you toward the answer, and sets
"break it then fix it" challenges.
