# Full-Stack TS Monorepo — Setup Playbook

A reusable, step-by-step guide for bootstrapping a **pnpm monorepo** with an
Express + TypeScript backend, a React + Vite frontend, a shared types package,
and Postgres in Docker. Captures the exact commands **and the gotchas we hit**,
so future projects go faster.

> Conventions: commands run from the **repo root** unless noted. Replace
> `@todo-app/*` and `todoapp` with your own names. `⚠️` marks a real trap we hit.

---

## 0. Prerequisites

```bash
node --version          # need a modern Node (v20+/v24)
corepack enable                          # pnpm comes via Corepack (bundled with Node)
corepack prepare pnpm@latest --activate
pnpm --version
docker --version        # install Docker Desktop if missing (needs WSL2 on Windows)
docker run hello-world  # confirms the Docker daemon works
```

- **pnpm** = disk-efficient, strict, great workspaces. **Corepack** is a Node
  built-in that downloads/pins package managers.

---

## 1. Initialize the workspace

```bash
git init
pnpm init                # creates root package.json
mkdir apps packages
```

Edit root **`package.json`**:

```jsonc
{
  "private": true,                    // a workspace root must NEVER be published
  "type": "module",
  "packageManager": "pnpm@11.5.2"     // Corepack reads THIS field (see gotcha)
}
```

Create **`pnpm-workspace.yaml`**:

```yaml
packages:
  - apps/*
  - packages/*
```

Create **`.gitignore`** (key entries):

```
node_modules
dist
.env
.env.*
!.env.example
*.local
.DS_Store
.vscode/*
!.vscode/extensions.json
```

> ⚠️ **`packageManager` vs `devEngines.packageManager`** — Corepack reads the
> top-level **string** `"packageManager": "pnpm@x.y.z"`. The object form
> `devEngines.packageManager` is a *different* mechanism (pnpm self-manages and,
> with `onFail: download`, installs pnpm into your lockfile as
> `packageManagerDependencies`). Use the top-level string.

> ⚠️ **No lockfile yet?** `pnpm install` won't create `pnpm-lock.yaml` until the
> workspace has at least one real dependency. Empty workspace = nothing to lock.
> Commit the lockfile once it appears; never commit `node_modules`.

---

## 2. Frontend — Vite + React + TypeScript

```bash
pnpm create vite apps/web --template react-ts
# choose "No" at "install and start now?" — install yourself from root
```

Edit `apps/web/package.json`: set `"name": "@todo-app/web"`, add `"private": true`.

```bash
pnpm install                          # lockfile is born here
pnpm --filter @todo-app/web dev       # http://localhost:5173
```

> ⚠️ **Path typo = silent no-op.** Scaffolding to `app/web` (instead of `apps/web`)
> puts it outside the `apps/*` glob, so it's not a workspace member — `pnpm install`
> installs nothing for it and `vite` won't be found. The path must match a glob in
> `pnpm-workspace.yaml`.

---

## 3. Backend — Express + TypeScript (manual, no scaffolder)

```bash
mkdir apps/api && cd apps/api
pnpm init
cd ../..
# runtime + dev deps
pnpm --filter @todo-app/api add express
pnpm --filter @todo-app/api add -D typescript tsx @types/node @types/express
```

Edit `apps/api/package.json`: `"name": "@todo-app/api"`, `"private": true`,
`"type": "module"`, and scripts:

```jsonc
"scripts": {
  "dev": "tsx watch src/index.ts",   // fast, auto-restart, NO type-checking
  "build": "tsc",                    // type-checks + emits to dist/
  "start": "node dist/index.js"
}
```

Create `apps/api/tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "module": "NodeNext",
    "moduleResolution": "NodeNext",  // critical pair for ESM-on-Node
    "target": "ES2022",
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

Write `apps/api/src/index.ts` (Express app, a `/health` route, listen on `PORT`).

```bash
pnpm --filter @todo-app/api dev
curl http://localhost:3000/health
```

> ⚠️ **All compiler options go INSIDE `compilerOptions`.** Only `include`,
> `exclude`, `files`, `extends`, `references` are valid top-level keys. Misplaced
> options are silently ignored — and `tsx` still runs (it ignores them), so the
> bug stays hidden until `tsc` build time. "It runs" ≠ "it's correct."

> ⚠️ **`ERR_PNPM_IGNORED_BUILDS`** (e.g. `esbuild`): pnpm blocks dependency build
> scripts by default (supply-chain safety). Allowlist trusted ones in
> **`pnpm-workspace.yaml`** (pnpm 11 moved this OUT of `package.json`):
> ```yaml
> onlyBuiltDependencies:
>   - esbuild
> ```
> Then `pnpm install` (or `pnpm rebuild <pkg>`). `allowBuilds` is NOT a real key —
> ignore autocomplete that invents it.

> 💡 **tsx vs tsc:** `tsx` (esbuild) = fast dev + watch, **no type-checking**.
> `tsc` = full type-check + production JS in `dist/`. Run `tsc --noEmit` in CI to
> actually gate types, since `tsx` running clean does NOT mean types are correct.

---

## 4. Shared package — the typed contract

```bash
mkdir packages/shared && cd packages/shared
pnpm init
cd ../..
```

Edit `packages/shared/package.json`:

```jsonc
{
  "name": "@todo-app/shared",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",      // without this, consumers get NO types
  "scripts": { "build": "tsc", "dev": "tsc --watch" }
}
```

`packages/shared/tsconfig.json` — same as API plus **`"declaration": true`**
(emits `.d.ts` files = the type contract). Define your domain types in
`src/index.ts`, then:

```bash
pnpm --filter @todo-app/shared build           # dist/ now has index.js + index.d.ts
pnpm --filter @todo-app/api add @todo-app/shared@workspace:*   # symlink, not download
```

Import in consumers: `import type { Task } from "@todo-app/shared";`

> ⚠️ **Stale build trap.** Consumers import shared's **`dist/`**. If you edit a
> type but forget to rebuild, everyone sees the OLD `.d.ts` → confusing errors.
> Run `pnpm --filter @todo-app/shared dev` (`tsc --watch`) during development.

> 💡 **`workspace:*`** tells pnpm "this is a local package — symlink it." At
> publish time it'd be swapped for a real version; we never publish, so it stays live.

---

## 5. Database — Postgres in Docker

Create **`docker-compose.yml`**:

```yaml
services:
  db:
    image: postgres:17 # PIN the version — never `latest` for infra
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: todoapp
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data # named volume = data persists
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d todoapp"] # user must match POSTGRES_USER
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
volumes:
  pg_data:
```

Env files (per app): `apps/api/.env` (gitignored) + `apps/api/.env.example`
(committed template):

```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/todoapp
```

```bash
docker compose up -d
docker compose ps
docker compose exec db psql -U user -d todoapp -c "SELECT version();"
```

> ⚠️ **Data persistence:** *no volume* → data dies when the container is removed.
> *named volume* (best for DBs) → persists across restarts. *bind mount* → host
> folder, but cross-OS permission/perf headaches. **`docker compose down -v`
> DELETES the named volume** — plain `down` keeps it.

> ⚠️ Healthcheck must use the **real configured user** (`-U user`), not `postgres`,
> which doesn't exist when `POSTGRES_USER` is set to something else.

---

## 6. Connect API → Postgres (raw `pg`, pre-ORM)

```bash
pnpm --filter @todo-app/api add pg dotenv
pnpm --filter @todo-app/api add -D @types/pg
```

In `src/index.ts`: `import "dotenv/config";` (top), create a `pg` `Pool` from
`process.env.DATABASE_URL`, query in an `async` handler, wrap in `try/catch`.

> ⚠️ **THE UNTYPED BOUNDARY (most important lesson).** `pg` types rows as `any[]`.
> A `const tasks: Task[] = rows.map(...)` annotation is an *unverified assertion* —
> TS won't catch it if the DB returns a number where you declared a string, or a
> `Date` where you declared a string. Boundaries the compiler can't see (DB driver,
> `fetch().json()`, `JSON.parse`, `process.env`) are all `any`/`unknown`. Real fix:
> validate at the boundary (Zod) or generate types from the schema (Prisma).

> ⚠️ Don't `res.send({ error: e })` — leaks internals AND serializes Errors to `{}`.
> Log server-side (`console.error(e)`), return a generic message to the client.

---

## 7. Frontend → API (CORS + fetch)

```bash
pnpm --filter @todo-app/api add cors
pnpm --filter @todo-app/api add -D @types/cors
pnpm --filter @todo-app/web add @todo-app/shared@workspace:*
```

Add `app.use(cors())` to Express. In React, `fetch` the API in a `useEffect`,
store in `useState<Task[]>`, render the list.

> ⚠️ **Same-Origin Policy:** browser at `:5173` calling API at `:3000` is blocked
> unless the server sends CORS headers (`Access-Control-Allow-Origin`). Enable
> `cors` on the API (or use a Vite dev proxy to make it same-origin).

> ⚠️ React lists need a unique **`key`** prop (`key={item.id}`). And
> `response.json()` returns `any` — same untyped-boundary lesson as `pg`.

---

## 8. Quality-of-life — root scripts + cheat sheet

Add wrapper scripts to the **root** `package.json` so daily commands are short
verbs (`pnpm dev`, `pnpm db:migrate`) instead of long `--filter ... exec ...`
strings. Keep a `README.md` "Common commands" table. Discover scripts with
`pnpm run`; search shell history with `Ctrl+R`. **You don't memorize commands —
you alias them and look them up.**

---

## 9. ORM — Prisma (replaces raw `pg`)

```bash
pnpm --filter @todo-app/api add @prisma/client
pnpm --filter @todo-app/api add -D prisma
# approve build scripts (see gotcha), then:
pnpm --filter @todo-app/api exec prisma init
# define models in prisma/schema.prisma, then:
pnpm db:migrate --name init      # creates + applies migration, regenerates client
```

> ⚠️ **Build-script gate again:** Prisma triggers `ERR_PNPM_IGNORED_BUILDS` for
> `prisma` and `@prisma/engines`. Add them to `onlyBuiltDependencies`. **Quote
> `"@prisma/engines"`** in YAML — a leading `@` is a reserved character.

> 💡 **Why Prisma fixes the boundary:** its client types are **generated from your
> schema**, so `prisma.task.findMany()` is genuinely typed end-to-end — unlike a
> hand-written row type, the generated types can't silently disagree with the DB.

> 💡 **Migrations** under `prisma/migrations/` are version-controlled schema
> history — commit them, replay on any machine/CI. Never edit the DB by hand again.

---

## Consolidated troubleshooting index

| Symptom | Cause / Fix |
|---|---|
| `vite: not recognized` after scaffold | Wrong path (outside `apps/*` glob) → deps not installed. Re-scaffold to correct path. |
| `pnpm-lock.yaml` not created | No dependencies yet. Normal — appears with first real dep. |
| `ERR_PNPM_IGNORED_BUILDS` | Add the package to `onlyBuiltDependencies` in `pnpm-workspace.yaml`, then `pnpm install` / `pnpm rebuild <pkg>`. |
| `pnpm` field in package.json "ignored" | pnpm 11 reads settings from `pnpm-workspace.yaml`, not `package.json`. |
| tsconfig options not taking effect | They must be inside `compilerOptions`. |
| Build emits to wrong place / wrong module | Same — misplaced `outDir`/`module` outside `compilerOptions`. |
| Consumer sees old shared types | Rebuild the shared package (`tsc --watch` in dev). |
| Browser blocks API call (CORS error) | Enable `cors` on the API or use a Vite dev proxy. |
| API returns wrong types but TS didn't catch it | Untyped boundary (`pg`/`fetch` = `any`). Validate with Zod / use Prisma. |
| `@prisma/engines` YAML parse error | Quote it: `- "@prisma/engines"`. |

---

_Last updated: Phase 1 (Prisma adoption). Keep extending as the project grows._
