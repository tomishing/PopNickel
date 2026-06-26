# PopNickel

Household expense tracking app for Android. Scan receipts with OCR, track spending by category, and manage monthly budgets.

## Tech stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS + Capacitor 7 (Android)
- **State:** Zustand (auth/UI) + TanStack Query v5 (server state)
- **Backend:** Python 3.12 + FastAPI + SQLAlchemy 2.0 async + PostgreSQL 16
- **OCR pipeline:** Google Cloud Vision → Claude API (item extraction)
- **Storage:** Cloudflare R2 (receipt images) / local filesystem (prototype)

## Features (Phase 1)

- JWT auth (register / login)
- Manual expense entry with categories
- Monthly expense list with category summary
- Receipt scan → Claude vision parsing → confirm → save as expenses
- Free tier: 10 receipt scans/month
- Material You (M3) UI — styled as a native Pixel 8 Android app

## Local development

**Prerequisites:** Docker, Node.js 20+, Python 3.12

```bash
# 1. Start PostgreSQL
docker-compose up -d db

# 2. Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # fill in SECRET_KEY and optionally ANTHROPIC_API_KEY
alembic upgrade head
python scripts/seed_categories.py
uvicorn app.main:app --reload --port 8001

# 3. Frontend (separate terminal)
cd frontend
npm install --legacy-peer-deps
npm run dev                   # → http://localhost:5173
```

Open **http://localhost:5173** in Chrome.

## Project structure

```
PopNickel/
├── frontend/
│   └── src/
│       ├── pages/        # LoginPage, DashboardPage, AddExpensePage, ScanReceiptPage
│       ├── components/   # AppLayout, StatusBar, BottomNav
│       ├── hooks/        # useAuth, useExpenses, useCategories, useScanReceipt
│       ├── api/          # axios functions (auth, expenses, categories, receipts)
│       ├── store/        # Zustand stores (auth token, month filter)
│       └── types/        # Shared TypeScript types
├── backend/
│   └── app/
│       ├── api/v1/       # auth, expenses, categories, receipts, budgets
│       ├── models/       # SQLAlchemy models (User, Expense, Category, Receipt…)
│       ├── schemas/      # Pydantic request/response schemas
│       └── core/         # config, database, security (JWT)
├── docker-compose.yml
└── README.md
```

## Environment variables

**backend/.env**
```
DATABASE_URL=postgresql+asyncpg://expense_user:expense_pass@localhost:5432/expense_db
SECRET_KEY=your-secret-key-here
ANTHROPIC_API_KEY=          # optional — enables Claude vision receipt parsing
GOOGLE_CLOUD_VISION_API_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:8001
```

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Login → JWT |
| GET | `/api/v1/auth/me` | Current user |
| GET | `/api/v1/expenses?month=YYYY-MM` | List expenses |
| POST | `/api/v1/expenses` | Add expense |
| GET | `/api/v1/expenses/summary?month=YYYY-MM` | Totals by category |
| GET | `/api/v1/categories` | List categories |
| POST | `/api/v1/receipts/scan` | Upload + parse receipt |
| POST | `/api/v1/receipts/{id}/confirm` | Save parsed items as expenses |

Interactive docs at **http://localhost:8001/docs**
