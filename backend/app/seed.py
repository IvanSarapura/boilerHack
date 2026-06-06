"""Datos demo idempotentes. Ejecutar con: uv run python -m app.seed"""

import asyncio

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.item import Item

DEMO_ITEMS = [
    {"title": "Configurar el backend", "description": "FastAPI + SQLAlchemy", "done": True},
    {"title": "Conectar el frontend", "description": "TanStack Query + apiClient", "done": False},
]


async def seed() -> None:
    async with SessionLocal() as session:
        existing = await session.scalar(select(Item).limit(1))
        if existing is not None:
            print("Seed omitido: ya existen items.")
            return
        session.add_all(Item(**data) for data in DEMO_ITEMS)
        await session.commit()
        print(f"Seed completado: {len(DEMO_ITEMS)} items creados.")


if __name__ == "__main__":
    asyncio.run(seed())
