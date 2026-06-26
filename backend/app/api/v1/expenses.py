import uuid
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.category import Category
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseOut, ExpenseSummaryItem, ExpenseUpdate

router = APIRouter(prefix="/expenses", tags=["expenses"])


def _month_bounds(month: str) -> tuple[date, date]:
    year, mon = int(month[:4]), int(month[5:7])
    start = date(year, mon, 1)
    if mon == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, mon + 1, 1)
    return start, end


# /summary must be declared before /{expense_id} so FastAPI doesn't treat
# the literal "summary" as a UUID path parameter.
@router.get("/summary", response_model=list[ExpenseSummaryItem])
async def expense_summary(
    month: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = (
        select(
            Expense.category_id,
            Category.name.label("category_name"),
            func.sum(Expense.amount).label("total"),
        )
        .join(Category, Expense.category_id == Category.id)
        .where(Expense.user_id == current_user.id)
        .group_by(Expense.category_id, Category.name)
        .order_by(func.sum(Expense.amount).desc())
    )
    if month:
        start, end = _month_bounds(month)
        q = q.where(Expense.date >= start, Expense.date < end)

    rows = (await db.execute(q)).all()
    return [
        ExpenseSummaryItem(
            category_id=r.category_id,
            category_name=r.category_name,
            total=Decimal(r.total),
        )
        for r in rows
    ]


@router.get("", response_model=list[ExpenseOut])
async def list_expenses(
    month: str | None = None,
    category_id: uuid.UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Expense).where(Expense.user_id == current_user.id)
    if month:
        start, end = _month_bounds(month)
        q = q.where(Expense.date >= start, Expense.date < end)
    if category_id:
        q = q.where(Expense.category_id == category_id)
    q = q.order_by(Expense.date.desc(), Expense.created_at.desc())

    result = await db.execute(q)
    return result.scalars().all()


@router.post("", response_model=ExpenseOut, status_code=201)
async def create_expense(
    body: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    expense = Expense(user_id=current_user.id, **body.model_dump())
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    return expense


@router.put("/{expense_id}", response_model=ExpenseOut)
async def update_expense(
    expense_id: uuid.UUID,
    body: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    expense = await db.get(Expense, expense_id)
    if not expense or expense.user_id != current_user.id:
        raise HTTPException(404, "Expense not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(expense, k, v)
    await db.commit()
    await db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204)
async def delete_expense(
    expense_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    expense = await db.get(Expense, expense_id)
    if not expense or expense.user_id != current_user.id:
        raise HTTPException(404, "Expense not found")
    await db.delete(expense)
    await db.commit()
