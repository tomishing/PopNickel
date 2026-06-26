import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import NUMERIC, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    category_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("categories.id"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(NUMERIC(10, 2), nullable=False)
    period: Mapped[str] = mapped_column(ENUM("monthly", "weekly", name="period_enum", create_type=False), default="monthly")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
