# PopNickel

Household expense tracking app for Android. Scan receipts with OCR, track spending by category, and manage monthly budgets.

## Tech stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS + Capacitor 7 (Android)
- **Backend:** Python 3.12 + FastAPI + SQLAlchemy 2.0 + PostgreSQL 16
- **OCR pipeline:** Google Cloud Vision → Claude API (item extraction)
- **Storage:** Cloudflare R2 (receipt images)

## Features (Phase 1)

- JWT auth (register / login)
- Manual expense entry with categories
- Monthly expense list + category bar chart
- Receipt scan → OCR → parsed line items → confirm → save
- Free tier: 10 receipt scans/month

## Local development

**Prerequisites:** Docker, Node.js 20+, Python 3.12

```bash
# Start backend + database
docker-compose up -d

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (in a separate terminal)
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

## Project structure

```
PopNickel/
├── frontend/          # React + Vite + Capacitor
│   └── src/
│       ├── pages/     # LoginPage, DashboardPage, AddExpensePage, ScanReceiptPage
│       ├── components/
│       ├── hooks/
│       ├── store/     # Zustand
│       ├── api/       # TanStack Query + axios
│       └── types/
├── backend/
│   └── app/
│       ├── api/v1/    # auth, expenses, receipts, categories, budgets
│       ├── models/    # SQLAlchemy models
│       ├── schemas/   # Pydantic schemas
│       ├── services/  # ocr, parser, storage, stripe
│       └── core/      # config, database, security
└── docker-compose.yml
```

## Environment variables

**backend/.env**
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/expense_db
SECRET_KEY=
GOOGLE_CLOUD_VISION_API_KEY=
ANTHROPIC_API_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:8000
```
