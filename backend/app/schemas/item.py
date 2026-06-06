from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

# Fuente de verdad del contrato. Las definiciones Zod del frontend
# (src/features/items/schemas.ts) deben reflejar estos campos 1:1.


class ItemBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    done: bool = False


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    done: bool | None = None


class ItemRead(ItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime
