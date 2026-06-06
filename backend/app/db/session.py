from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

# El esquema de DATABASE_URL define dialecto + driver. No hay ramificación por
# motor en el código de la aplicación: cambiar de BD = cambiar esta variable.
engine = create_async_engine(settings.database_url, future=True)

SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)


async def get_session() -> AsyncGenerator[AsyncSession]:
    """Dependencia de FastAPI: una sesión async por request."""
    async with SessionLocal() as session:
        yield session
