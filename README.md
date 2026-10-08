# PopNickel

Household expense tracking app for Android. Scan receipts with OCR, track spending by category, and manage monthly budgets.

<p>
  <img src="assets/images/home.png" alt="home" width="182"> <img src="assets/images/login.png" alt="login" width="189"> <img src="assets/images/addexpense.png" alt="Add an item" width="182"> <img src="assets/images/scan.png" alt="Scan a receipt" width="182">
</p>

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
- Receipt scan → Google Cloud Vision OCR → Claude item parsing → confirm → save as expenses *(in progress, see [Next steps](#next-steps))*
- Free tier: 10 receipt scans/month
- Material You (M3) UI — styled as a native Pixel 8 Android app

## Local development

**Prerequisites:** Docker, Node.js 20+, Python 3.12

```bash
# 1. Backend + PostgreSQL (Docker) → http://localhost:8000
cp backend/.env.example backend/.env   # fill in SECRET_KEY (and API keys for receipt scanning)
docker compose up -d
docker compose exec backend alembic upgrade head
docker compose exec backend python scripts/seed_categories.py   # first time only — not idempotent

# 2. Frontend (separate terminal)
cd frontend
npm install
npm run dev                            # → http://localhost:5173
```

The backend container reloads automatically when files in `backend/` change. After changing `backend/requirements.txt`, rebuild it with `docker compose up -d --build backend`.

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
ANTHROPIC_API_KEY=           # required for receipt scanning (item parsing)
GOOGLE_CLOUD_VISION_API_KEY= # required for receipt scanning (OCR)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:8000
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

Interactive docs at **http://localhost:8000/docs**

## Next steps

Receipt scanning is not functional yet. The scan endpoint, quota check and review UI exist, but the image storage, OCR and parsing services are still stubs.

1. **Backend scan pipeline**: implement image storage (local `uploads/`), Google Cloud Vision OCR and Claude item parsing so `POST /api/v1/receipts/scan` returns real items. Requires `GOOGLE_CLOUD_VISION_API_KEY` and `ANTHROPIC_API_KEY`.
2. **Scan page**: use a file/photo picker in the browser to test the full flow (photo → review items → confirm → expenses saved).
3. **Android**: `npx cap add android`, add real camera capture with `@capgo/camera-preview`, test on a device or emulator.
4. **Tests**: registration, expense CRUD, scan quota.
5. **Phase 2**: Stripe subscriptions, budget tracking, Cloudflare R2 storage.
