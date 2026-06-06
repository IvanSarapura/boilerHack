from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate


class ItemRepository:
    """Única capa que importa SQLAlchemy para el recurso Item.
    Aísla el motor de BD del resto de la aplicación."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list(self) -> list[Item]:
        result = await self._session.execute(select(Item).order_by(Item.created_at.desc()))
        return list(result.scalars().all())

    async def get(self, item_id: str) -> Item | None:
        return await self._session.get(Item, item_id)

    async def create(self, data: ItemCreate) -> Item:
        item = Item(**data.model_dump())
        self._session.add(item)
        await self._session.commit()
        await self._session.refresh(item)
        return item

    async def update(self, item_id: str, data: ItemUpdate) -> Item | None:
        item = await self._session.get(Item, item_id)
        if item is None:
            return None
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(item, field, value)
        await self._session.commit()
        await self._session.refresh(item)
        return item

    async def delete(self, item_id: str) -> bool:
        item = await self._session.get(Item, item_id)
        if item is None:
            return False
        await self._session.delete(item)
        await self._session.commit()
        return True
