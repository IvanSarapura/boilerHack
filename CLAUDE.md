# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Hackathon boilerplate: a Next.js 16 frontend plus an optional, decoupled FastAPI backend in `backend/`. The two deploy separately and talk over HTTP (`NEXT_PUBLIC_API_URL`, default `http://localhost:8000`).

## Commands

All commands run from the repo root. Backend scripts wrap [uv](https://docs.astral.sh/uv/) (required for anything `backend:*`).

```bash
npm run dev               # frontend only (:3000)
npm run dev:all           # frontend (:3000) + FastAPI (:8000) concurrently
npm run lint              # ESLint
npm run typecheck         # tsc --noEmit
npm run format            # Prettier write; format:check for CI-style check
npm run build             # production build

npm run backend:install   # uv sync (first-time backend setup)
npm run backend:dev       # uvicorn with reload on :8000
npm run backend:migrate   # alembic upgrade head
npm run backend:seed      # idempotent demo data
npm run backend:test      # pytest (all tests)
npm run backend:lint      # ruff check
npm run db:up / db:down   # Postgres 16 via docker compose (only if not using default SQLite)
```

Single backend test: `uv run --directory backend pytest tests/test_items.py::test_name -q`
New migration: `uv run --directory backend alembic revision --autogenerate -m "msg"` (then review it)
Backend Python format: `uv run --directory backend ruff format .`
Add shadcn component: `npx shadcn@latest add <name>` (lands in `src/components/ui/`, editable like any file)

There are no frontend tests. CI (`.github/workflows/ci.yml`) runs `format:check + lint + typecheck + build` — Prettier failures break CI, so format before committing.

First-time backend setup needs `cp backend/.env.example backend/.env`; frontend env goes in `.env.local` (from `.env.example`).

## Architecture

### Frontend ↔ backend contract

The two sides mirror each other and must stay in sync manually:

- `backend/app/schemas/<resource>.py` (Pydantic v2) ↔ `src/features/<resource>/schemas.ts` (Zod) — same fields, 1:1.
- Backend errors always use the envelope `{ "error": { "message": string, "status": number } }` (`backend/app/core/errors.py`), which `apiClient` in `src/lib/api/client.ts` unwraps into `ApiError(message, status)`.

### Frontend (`src/`)

- Vertical slices in `src/features/<resource>/` with `schemas.ts` (Zod) → `api.ts` (calls `apiClient` with `env.NEXT_PUBLIC_API_URL`) → `hooks.ts` (TanStack Query, mutations invalidate the list key) → `components/`. `src/features/items/` is the reference slice — copy and rename it for new resources.
- `src/lib/api/client.ts`: typed `apiClient<T>()` with optional Zod `schema` for response validation (use it for critical endpoints; omit for trivial ones).
- `src/lib/env.ts`: Zod-validated env vars. Never read `process.env` directly in app code — add the variable to the schema and import `env`. Secrets belong in `backend/.env`, never with a `NEXT_PUBLIC_` prefix.
- `src/app/layout.tsx` wires the provider stack (ThemeProvider via next-themes, QueryProvider, sonner Toaster).
- Tailwind v4: all config lives in `src/app/globals.css` (`@import 'tailwindcss'` + shadcn tokens). There is no `tailwind.config.js`.
- React Compiler is enabled (`babel-plugin-react-compiler`).

### Backend (`backend/app/`)

Layered; database-engine agnostic. Only `repositories/` import SQLAlchemy — switching SQLite → Postgres/MySQL/SQL Server is just changing `DATABASE_URL` in `backend/.env` (SQLite is the zero-infra default; engine table in `backend/README.md`).

Request flow: `api/v1/<resource>.py` (router) → `api/deps.py` (DI: session → repository → service) → `services/` (business logic) → `repositories/` (SQLAlchemy CRUD) → `models/` (ORM).

New resource = copy the `items` slice bottom-up: model → schemas → repository → service → router (mount in `api/v1/router.py`) → autogenerate migration → mirror in `src/features/`.

Tests (`backend/tests/`) run against in-memory SQLite via pytest-asyncio (`asyncio_mode = "auto"`).

## Design decisions (don't undo)

- No Storybook, no Husky, no frontend test framework — intentional zero-friction hackathon setup.
- Backend stays engine-agnostic: never import SQLAlchemy outside `repositories/` (and `models/`/`db/`).
- Backend is optional and decoupled — don't fold it into Next.js route handlers.
