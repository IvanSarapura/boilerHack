from fastapi import APIRouter, status

from app.api.deps import ItemServiceDep
from app.schemas.item import ItemCreate, ItemRead, ItemUpdate

router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=list[ItemRead])
async def list_items(service: ItemServiceDep) -> list[ItemRead]:
    return await service.list()


@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
async def create_item(data: ItemCreate, service: ItemServiceDep) -> ItemRead:
    return await service.create(data)


@router.get("/{item_id}", response_model=ItemRead)
async def get_item(item_id: str, service: ItemServiceDep) -> ItemRead:
    return await service.get(item_id)


@router.put("/{item_id}", response_model=ItemRead)
async def update_item(item_id: str, data: ItemUpdate, service: ItemServiceDep) -> ItemRead:
    return await service.update(item_id, data)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str, service: ItemServiceDep) -> None:
    await service.delete(item_id)
