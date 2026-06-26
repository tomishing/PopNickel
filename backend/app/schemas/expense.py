import uuid
from datetime import date as DateType
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    category_id: uuid.UUID
    amount: Decimal
    description: str
    date: DateType
    currency: str = "CAD"


class ExpenseUpdate(BaseModel):
    category_id: uuid.UUID | None = None
    amount: Decimal | None = None
    description: str | None = None
    date: DateType | None = None


class ExpenseOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    category_id: uuid.UUID
    amount: Decimal
    currency: str
    description: str
    date: DateType
    source: str
    receipt_id: uuid.UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ExpenseSummaryItem(BaseModel):
    category_id: uuid.UUID
    category_name: str
    total: Decimal
