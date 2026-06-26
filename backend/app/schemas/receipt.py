import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class ParsedItem(BaseModel):
    name: str
    amount: Decimal
    category: str


class ParsedReceipt(BaseModel):
    merchant: str | None
    date: str | None
    total: Decimal | None
    items: list[ParsedItem]


class ReceiptScanOut(BaseModel):
    receipt_id: uuid.UUID
    parsed: ParsedReceipt
    scans_used: int
    scans_limit: int | None


class ReceiptConfirmItem(BaseModel):
    name: str
    amount: Decimal
    category_id: uuid.UUID


class ReceiptConfirmRequest(BaseModel):
    items: list[ReceiptConfirmItem]


class ReceiptOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    image_url: str
    merchant: str | None
    total: Decimal | None
    scanned_at: datetime

    model_config = {"from_attributes": True}
