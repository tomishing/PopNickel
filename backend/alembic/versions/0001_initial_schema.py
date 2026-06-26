"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-25 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID

from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- enums -----------------------------------------------------------
    plan_enum = sa.Enum("free", "paid", name="plan_enum")
    source_enum = sa.Enum("manual", "receipt", name="source_enum")
    period_enum = sa.Enum("monthly", "weekly", name="period_enum")
    plan_enum.create(op.get_bind(), checkfirst=True)
    source_enum.create(op.get_bind(), checkfirst=True)
    period_enum.create(op.get_bind(), checkfirst=True)

    # --- users -----------------------------------------------------------
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(200), nullable=False),
        sa.Column(
            "plan",
            sa.Enum("free", "paid", name="plan_enum", create_type=False),
            nullable=False,
            server_default="free",
        ),
        sa.Column("stripe_customer_id", sa.String(), nullable=True),
        sa.Column("stripe_subscription_id", sa.String(), nullable=True),
        sa.Column("scans_used_this_month", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("scans_reset_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_unique_constraint("uq_users_email", "users", ["email"])
    op.create_index("ix_users_email", "users", ["email"])

    # --- categories ------------------------------------------------------
    op.create_table(
        "categories",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("icon", sa.String(), nullable=False),
        sa.Column("color", sa.String(), nullable=False),
    )
    op.create_index("ix_categories_user_id", "categories", ["user_id"])

    # --- receipts --------------------------------------------------------
    op.create_table(
        "receipts",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("image_url", sa.String(), nullable=False),
        sa.Column("merchant", sa.String(), nullable=True),
        sa.Column("total", sa.Numeric(10, 2), nullable=True),
        sa.Column("scanned_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("raw_ocr_text", sa.Text(), nullable=True),
        sa.Column("parsed_items", JSONB(), nullable=True),
    )
    op.create_index("ix_receipts_user_id", "receipts", ["user_id"])

    # --- expenses --------------------------------------------------------
    op.create_table(
        "expenses",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("category_id", UUID(as_uuid=True), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default="CAD"),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column(
            "source",
            sa.Enum("manual", "receipt", name="source_enum", create_type=False),
            nullable=False,
            server_default="manual",
        ),
        sa.Column("receipt_id", UUID(as_uuid=True), sa.ForeignKey("receipts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_expenses_user_id", "expenses", ["user_id"])
    op.create_index("ix_expenses_date", "expenses", ["date"])

    # --- receipt_items ---------------------------------------------------
    op.create_table(
        "receipt_items",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("receipt_id", UUID(as_uuid=True), sa.ForeignKey("receipts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("category_id", UUID(as_uuid=True), sa.ForeignKey("categories.id"), nullable=True),
    )
    op.create_index("ix_receipt_items_receipt_id", "receipt_items", ["receipt_id"])

    # --- budgets ---------------------------------------------------------
    op.create_table(
        "budgets",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("category_id", UUID(as_uuid=True), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column(
            "period",
            sa.Enum("monthly", "weekly", name="period_enum", create_type=False),
            nullable=False,
            server_default="monthly",
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_budgets_user_id", "budgets", ["user_id"])


def downgrade() -> None:
    op.drop_table("budgets")
    op.drop_table("receipt_items")
    op.drop_table("expenses")
    op.drop_table("receipts")
    op.drop_table("categories")
    op.drop_table("users")

    sa.Enum(name="period_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="source_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="plan_enum").drop(op.get_bind(), checkfirst=True)
