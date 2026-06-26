import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import DATE, NUMERIC, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    category_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("categories.id"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(NUMERIC(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="CAD")
    description: Mapped[str] = mapped_column(String, nullable=False)
    date: Mapped[date] = mapped_column(DATE, nullable=False)
    source: Mapped[str] = mapped_column(ENUM("manual", "receipt", name="source_enum", create_type=False), default="manual")
    receipt_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("receipts.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
