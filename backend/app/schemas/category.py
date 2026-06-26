import uuid

from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    icon: str
    color: str


class CategoryUpdate(BaseModel):
    name: str | None = None
    icon: str | None = None
    color: str | None = None


class CategoryOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID | None
    name: str
    icon: str
    color: str

    model_config = {"from_attributes": True}
