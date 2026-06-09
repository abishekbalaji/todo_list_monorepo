# To-Do App

A feature-rich full-stack to-do application, built as a senior-level full-stack
learning project. See [`ROADMAP.md`](./ROADMAP.md) for the full plan and progress.

## Tech stack

| Layer    | Tech                                                   |
| -------- | ------------------------------------------------------ |
| Monorepo | pnpm workspaces                                        |
| Backend  | Node.js, Express 5, TypeScript (ESM)                   |
| Database | PostgreSQL 17 (Docker), Prisma ORM                     |
| Frontend | React 19, TypeScript, Vite                             |
| Shared   | `@todo-app/shared` — types/contracts used by both ends |

## Project structure

```
todo-app/
├─ apps/
│  ├─ api/      # Express + TypeScript backend
│  └─ web/      # React + TypeScript frontend (Vite)
├─ packages/
│  └─ shared/   # Types & contracts imported by both apps
├─ docker-compose.yml   # Local Postgres
└─ pnpm-workspace.yaml  # Workspace + pnpm settings
```

## Prerequisites

- Node.js (v24+) and pnpm (via Corepack: `corepack enable`)
- Docker Desktop (for Postgres)

## Getting started

```bash
# 1. Install dependencies (whole workspace)
pnpm install

# 2. Set up env files
cp apps/api/.env.example apps/api/.env   # then fill in real values

# 3. Start the database
pnpm db:up

# 4. Apply migrations
pnpm db:migrate

# 5. Run the apps (api + web + shared watcher, all at once)
pnpm dev
```

API: http://localhost:3000 · Web: http://localhost:5173

---

## Common commands (cheat sheet)

> Run all of these from the **repo root**. Forgot a command? Run `pnpm run` to
> list every script, or press `Ctrl+R` in your shell to search command history.

### Dev / build

| Command        | What it does                               |
| -------------- | ------------------------------------------ |
| `pnpm dev`     | Run api + web + shared watcher in parallel |
| `pnpm dev:api` | Run only the backend                       |
| `pnpm dev:web` | Run only the frontend                      |
| `pnpm build`   | Build every package (`pnpm -r build`)      |

### Database (Docker)

| Command        | What it does                        |
| -------------- | ----------------------------------- |
| `pnpm db:up`   | Start Postgres container (detached) |
| `pnpm db:down` | Stop the container (keeps data)     |

### Database (Prisma)

| Command                         | What it does                       |
| ------------------------------- | ---------------------------------- |
| `pnpm db:migrate --name <name>` | Create + apply a migration in dev  |
| `pnpm db:generate`              | Regenerate the Prisma Client       |
| `pnpm db:studio`                | Open Prisma Studio (DB GUI)        |
| `pnpm db:seed`                  | Seed the database                  |
| `pnpm db:reset`                 | ⚠️ Wipe DB + replay all migrations |

### Handy pnpm patterns

| Pattern                                  | Meaning                                         |
| ---------------------------------------- | ----------------------------------------------- |
| `pnpm -F @todo-app/api <script>`         | Run a script in one package (`-F` = `--filter`) |
| `pnpm -r <script>`                       | Run a script in every package (recursive)       |
| `pnpm --filter @todo-app/api exec <cmd>` | Run any binary inside a package                 |
| `pnpm run`                               | List all scripts in the current package         |

### Docker / psql quick reference

| Command                                          | What it does                           |
| ------------------------------------------------ | -------------------------------------- |
| `docker compose ps`                              | Show running containers + health       |
| `docker compose logs -f db`                      | Tail the database logs                 |
| `docker compose exec db psql -U user -d todoapp` | Open a SQL shell                       |
| `docker compose down -v`                         | ⚠️ Stop **and delete the data volume** |

---
