from app.core.errors import NotFoundError
from app.models.item import Item
from app.repositories.item import ItemRepository
from app.schemas.item import ItemCreate, ItemUpdate


class ItemService:
    """Lógica de negocio del recurso Item. Agnóstica al motor: solo depende
    del repositorio, nunca de SQLAlchemy."""

    def __init__(self, repository: ItemRepository) -> None:
        self._repository = repository

    async def list(self) -> list[Item]:
        return await self._repository.list()

    async def get(self, item_id: str) -> Item:
        item = await self._repository.get(item_id)
        if item is None:
            raise NotFoundError(f"Item {item_id} no encontrado")
        return item

    async def create(self, data: ItemCreate) -> Item:
        return await self._repository.create(data)

    async def update(self, item_id: str, data: ItemUpdate) -> Item:
        item = await self._repository.update(item_id, data)
        if item is None:
            raise NotFoundError(f"Item {item_id} no encontrado")
        return item

    async def delete(self, item_id: str) -> None:
        deleted = await self._repository.delete(item_id)
        if not deleted:
            raise NotFoundError(f"Item {item_id} no encontrado")
