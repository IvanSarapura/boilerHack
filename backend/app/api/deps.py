from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.repositories.item import ItemRepository
from app.services.item import ItemService

SessionDep = Annotated[AsyncSession, Depends(get_session)]


async def get_item_service(session: SessionDep) -> AsyncGenerator[ItemService]:
    yield ItemService(ItemRepository(session))


ItemServiceDep = Annotated[ItemService, Depends(get_item_service)]
