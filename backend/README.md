# Backend — boilerHack API

API REST con **FastAPI** + **SQLAlchemy 2.0 async** + **Alembic**. Es **agnóstica al motor de base de datos**: el código no conoce si hablás con SQLite, PostgreSQL, MySQL o SQL Server — solo cambiás `DATABASE_URL`.

Corre en `http://localhost:8000`. El frontend (Next.js, `:3000`) la consume vía `apiClient` con `NEXT_PUBLIC_API_URL`.

## Arrancar (ruta rápida, sin Docker)

Por defecto usa **SQLite**, así que no necesitás instalar nada de infra:

```bash
# desde la raíz del repo
npm run backend:install        # uv sync
cp backend/.env.example backend/.env
npm run backend:migrate        # crea las tablas
npm run backend:seed           # (opcional) datos demo
npm run backend:dev            # API en http://localhost:8000
```

- Docs interactivas (Swagger): <http://localhost:8000/docs>
- Health check: <http://localhost:8000/api/v1/health>

> Requiere [uv](https://docs.astral.sh/uv/). Instalalo con `curl -LsSf https://astral.sh/uv/install.sh | sh`.

## Cambiar de motor de base de datos

Solo editás `DATABASE_URL` en `backend/.env`. El código no cambia.

| Motor | `DATABASE_URL` | Driver | Notas |
| --- | --- | --- | --- |
| **SQLite** (default) | `sqlite+aiosqlite:///./dev.db` | incluido | Cero infra. Ideal para empezar. |
| **PostgreSQL** | `postgresql+asyncpg://boilerhack:boilerhack@localhost:5432/boilerhack` | incluido (`asyncpg`) | Levantá la BD con `npm run db:up`. |
| **MySQL/MariaDB** | `mysql+aiomysql://user:pass@localhost:3306/boilerhack` | `uv add aiomysql` | Charset utf8mb4. |
| **SQL Server** | `mssql+aioodbc://sa:pass@localhost:1433/boilerhack?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes&TrustServerCertificate=yes` | `uv add aioodbc` + **msodbcsql18** del SO | Único motor que necesita un driver ODBC a nivel de sistema operativo, no solo pip. |

Para PostgreSQL con Docker:

```bash
npm run db:up                  # levanta postgres:16 en :5432
# poné la DATABASE_URL de Postgres en backend/.env
npm run backend:migrate
npm run backend:dev
```

## Arquitectura

Capas con una responsabilidad única cada una. **Cambiar de motor nunca toca `services/` ni `api/`** porque solo los `repositories/` importan SQLAlchemy.

```
app/
  main.py              # create_app(): factory, CORS, handlers de error
  core/
    config.py          # Settings (pydantic-settings) — lee backend/.env
    errors.py          # AppError/NotFoundError + envelope JSON consistente
  db/
    base.py            # Base declarativa + convención de nombres (portabilidad)
    session.py         # engine async + sesión por request (DATABASE_URL)
  api/
    deps.py            # inyección: sesión → repository → service
    v1/
      health.py        # GET /api/v1/health
      items.py         # CRUD del recurso de ejemplo
  models/item.py       # ORM SQLAlchemy (único mapeo de tablas)
  schemas/item.py      # Pydantic v2 — fuente de verdad del contrato
  repositories/item.py # ÚNICO sitio que importa SQLAlchemy para Item
  services/item.py     # lógica de negocio, agnóstica al motor
  seed.py              # datos demo idempotentes
migrations/            # Alembic (plantilla async, lee DATABASE_URL de Settings)
tests/                 # pytest sobre SQLite in-memory
```

### El contrato Pydantic ↔ Zod

`schemas/item.py` (backend) y `src/features/items/schemas.ts` (frontend) describen los **mismos** campos. Si cambiás uno, actualizá el otro. Los errores salen siempre con la forma `{ "error": { "message": string, "status": number } }`, que mapea directo al `ApiError(message, status)` del frontend.

## Agregar un recurso nuevo

Copiá el slice de `items` de abajo hacia arriba y renombrá:

1. `models/<recurso>.py` — tabla SQLAlchemy.
2. `schemas/<recurso>.py` — `Create` / `Update` / `Read` (Pydantic).
3. `repositories/<recurso>.py` — CRUD contra `AsyncSession`.
4. `services/<recurso>.py` — reglas de negocio.
5. `api/v1/<recurso>.py` — router; montalo en `api/v1/router.py`.
6. Migración: `uv run --directory backend alembic revision --autogenerate -m "create <recurso>"` y revisala.
7. En el frontend, replicá `src/features/items/`.

## Migraciones (Alembic)

```bash
# crear una migración a partir de cambios en los modelos
uv run --directory backend alembic revision --autogenerate -m "mensaje"
# aplicar
npm run backend:migrate
# revertir la última
uv run --directory backend alembic downgrade -1
```

## Tests, lint y formato

```bash
npm run backend:test                       # pytest
npm run backend:lint                       # ruff check
uv run --directory backend ruff format .   # formatear
```

## Deploy

El frontend (Vercel) y este backend se despliegan por separado. Hay un `Dockerfile` listo para Render/Fly/Railway/cualquier contenedor. En producción configurá `DATABASE_URL` y `CORS_ORIGINS` como variables de entorno del servicio (no las commitees).
