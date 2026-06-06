from typing import Protocol, TypeVar

T = TypeVar("T")


class AbstractRepository(Protocol[T]):
    """Contrato de persistencia. La implementación concreta es el único punto
    del código que conoce el motor de BD (SQLAlchemy)."""

    async def list(self) -> list[T]: ...

    async def get(self, item_id: str) -> T | None: ...

    async def create(self, data: object) -> T: ...

    async def update(self, item_id: str, data: object) -> T | None: ...

    async def delete(self, item_id: str) -> bool: ...
