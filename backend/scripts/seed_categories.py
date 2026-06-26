"""Run once to seed default system categories (user_id = null)."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import AsyncSessionLocal
from app.models.category import Category

DEFAULT_CATEGORIES = [
    {"name": "Groceries",  "icon": "🛒", "color": "#4CAF50"},
    {"name": "Household",  "icon": "🏠", "color": "#2196F3"},
    {"name": "Dining",     "icon": "🍽️", "color": "#FF9800"},
    {"name": "Transport",  "icon": "🚗", "color": "#9C27B0"},
    {"name": "Health",     "icon": "💊", "color": "#F44336"},
    {"name": "Other",      "icon": "📦", "color": "#607D8B"},
]


async def seed():
    async with AsyncSessionLocal() as db:
        for cat in DEFAULT_CATEGORIES:
            db.add(Category(user_id=None, **cat))
        await db.commit()
    print("Default categories seeded.")


if __name__ == "__main__":
    asyncio.run(seed())
