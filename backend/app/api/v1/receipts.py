import base64
import json
import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.expense import Expense
from app.models.receipt import Receipt
from app.models.user import User
from app.schemas.receipt import (
    ParsedItem,
    ParsedReceipt,
    ReceiptConfirmRequest,
    ReceiptOut,
    ReceiptScanOut,
)

router = APIRouter(prefix="/receipts", tags=["receipts"])

FREE_SCAN_LIMIT = 10


def _check_and_increment_quota(user: User) -> None:
    now = datetime.utcnow()
    if user.scans_reset_at is None or user.scans_reset_at.month != now.month or user.scans_reset_at.year != now.year:
        user.scans_used_this_month = 0
        user.scans_reset_at = now
    if user.plan == "free" and user.scans_used_this_month >= FREE_SCAN_LIMIT:
        raise HTTPException(403, "Monthly scan limit reached. Upgrade to scan unlimited receipts.")
    user.scans_used_this_month += 1


def _save_locally(file_bytes: bytes, filename: str) -> str:
    upload_dir = settings.upload_dir
    os.makedirs(upload_dir, exist_ok=True)
    dest = os.path.join(upload_dir, filename)
    with open(dest, "wb") as f:
        f.write(file_bytes)
    return f"/uploads/{filename}"


async def _parse_with_claude(file_bytes: bytes, content_type: str) -> ParsedReceipt:
    """Send image directly to Claude for vision-based receipt parsing."""
    try:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        b64 = base64.standard_b64encode(file_bytes).decode()
        media_type = content_type if content_type in (
            "image/jpeg", "image/png", "image/gif", "image/webp"
        ) else "image/jpeg"

        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {"type": "base64", "media_type": media_type, "data": b64},
                        },
                        {
                            "type": "text",
                            "text": (
                                "Extract all line items from this receipt image. "
                                "Return ONLY valid JSON, no explanation:\n"
                                '{"merchant":"store name","date":"YYYY-MM-DD or null","total":0.00,'
                                '"items":[{"name":"item name","amount":0.00,'
                                '"category":"Groceries|Household|Dining|Transport|Health|Other"}]}'
                            ),
                        },
                    ],
                }
            ],
        )
        raw = message.content[0].text.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw.strip())
        return ParsedReceipt(
            merchant=data.get("merchant"),
            date=data.get("date"),
            total=data.get("total"),
            items=[ParsedItem(**i) for i in data.get("items", [])],
        )
    except Exception:
        return ParsedReceipt(merchant=None, date=None, total=None, items=[])


@router.post("/scan", response_model=ReceiptScanOut)
async def scan_receipt(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _check_and_increment_quota(current_user)

    file_bytes = await file.read()
    ext = (file.filename or "receipt.jpg").rsplit(".", 1)[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    image_url = _save_locally(file_bytes, filename)

    if settings.anthropic_api_key:
        parsed = await _parse_with_claude(file_bytes, file.content_type or "image/jpeg")
    else:
        parsed = ParsedReceipt(merchant=None, date=None, total=None, items=[])

    receipt = Receipt(
        user_id=current_user.id,
        image_url=image_url,
        merchant=parsed.merchant,
        total=parsed.total,
        parsed_items=parsed.model_dump(),
    )
    db.add(receipt)
    await db.commit()
    await db.refresh(receipt)

    return ReceiptScanOut(
        receipt_id=receipt.id,
        parsed=parsed,
        scans_used=current_user.scans_used_this_month,
        scans_limit=FREE_SCAN_LIMIT if current_user.plan == "free" else None,
    )


@router.post("/{receipt_id}/confirm", response_model=list[ReceiptOut])
async def confirm_receipt(
    receipt_id: uuid.UUID,
    body: ReceiptConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    receipt = await db.get(Receipt, receipt_id)
    if not receipt or receipt.user_id != current_user.id:
        raise HTTPException(404, "Receipt not found")

    scan_date = receipt.scanned_at.date()
    for item in body.items:
        expense = Expense(
            user_id=current_user.id,
            category_id=item.category_id,
            amount=item.amount,
            currency="CAD",
            description=item.name,
            date=scan_date,
            source="receipt",
            receipt_id=receipt.id,
        )
        db.add(expense)

    await db.commit()

    result = await db.execute(
        select(Receipt).where(
            Receipt.user_id == current_user.id,
            Receipt.id == receipt_id,
        )
    )
    return [result.scalar_one()]
