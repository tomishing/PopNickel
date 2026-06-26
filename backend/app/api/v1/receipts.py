import uuid

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.receipt import ReceiptConfirmRequest, ReceiptOut, ReceiptScanOut

router = APIRouter(prefix="/receipts", tags=["receipts"])


@router.post("/scan", response_model=ReceiptScanOut)
async def scan_receipt(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    raise NotImplementedError


@router.post("/{receipt_id}/confirm", response_model=list[ReceiptOut])
async def confirm_receipt(
    receipt_id: uuid.UUID,
    body: ReceiptConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    raise NotImplementedError
