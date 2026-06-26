from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.post("/create-checkout")
async def create_checkout(current_user: User = Depends(get_current_user)):
    raise NotImplementedError


@router.post("/webhook")
async def stripe_webhook():
    raise NotImplementedError


@router.get("/status")
async def subscription_status(current_user: User = Depends(get_current_user)):
    raise NotImplementedError
