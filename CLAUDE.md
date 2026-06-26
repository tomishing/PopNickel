# Household Expense Manager — Claude Code Spec

## Project overview
A household expense tracking Android app (Capacitor + React + Vite + FastAPI) targeting North American users.
Core differentiator: item-level OCR receipt scanning (free tier: 10 scans/month, paid: unlimited).

---

## Tech stack

### Frontend
- React 19 + Vite + TypeScript
- Tailwind CSS (utility-first styling)
- Zustand (global state)
- TanStack Query v5 (server state / API calls)
- React Router v7
- Capacitor 7 (native Android bridge)
- @capgo/camera-preview (CameraX-backed camera plugin)
- @capacitor/camera (fallback photo picker)
- Recharts (spending charts)
- date-fns (date formatting)

### Backend
- Python 3.12 + FastAPI
- SQLAlchemy 2.0 (async ORM)
- Alembic (migrations)
- PostgreSQL 16
- Pydantic v2 (request/response validation)
- python-jose (JWT auth)
- bcrypt (password hashing)
- anthropic (Python SDK — receipt item parsing)
- google-cloud-vision (OCR)
- boto3 (Cloudflare R2 image storage)
- stripe (subscription billing)

### Infrastructure
- Railway (hosting: both FastAPI + PostgreSQL)
- Cloudflare R2 (receipt image storage)
- Docker Compose (local development)

---

## Repository structure

```
expense-app/
├── frontend/                  # React + Vite + Capacitor
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route-level page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # Zustand stores
│   │   ├── api/               # TanStack Query + axios API layer
│   │   ├── types/             # Shared TypeScript types
│   │   └── utils/             # Helpers, formatters
│   ├── android/               # Capacitor Android shell (generated)
│   ├── vite.config.ts
│   ├── capacitor.config.ts
│   └── package.json
│
├── backend/                   # FastAPI
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py
│   │   │       ├── expenses.py
│   │   │       ├── receipts.py
│   │   │       ├── categories.py
│   │   │       ├── budgets.py
│   │   │       └── subscriptions.py
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   │   ├── ocr.py         # Google Cloud Vision
│   │   │   ├── parser.py      # Claude API item extraction
│   │   │   ├── storage.py     # Cloudflare R2
│   │   │   └── stripe.py      # Subscription management
│   │   ├── core/
│   │   │   ├── config.py      # Settings (pydantic-settings)
│   │   │   ├── database.py    # Async SQLAlchemy engine
│   │   │   └── security.py    # JWT helpers
│   │   └── main.py
│   ├── alembic/               # DB migrations
│   ├── requirements.txt
│   └── Dockerfile
│
└── docker-compose.yml         # Local dev: FastAPI + PostgreSQL
```

---

## Database schema

### users
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| email | VARCHAR UNIQUE | |
| hashed_password | VARCHAR | |
| full_name | VARCHAR | |
| plan | ENUM('free','paid') | default 'free' |
| stripe_customer_id | VARCHAR | nullable |
| stripe_subscription_id | VARCHAR | nullable |
| scans_used_this_month | INT | default 0 |
| scans_reset_at | TIMESTAMP | first day of month |
| created_at | TIMESTAMP | |

### categories
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | nullable (null = system default) |
| name | VARCHAR | e.g. "Groceries" |
| icon | VARCHAR | emoji or icon name |
| color | VARCHAR | hex color |

### expenses
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| category_id | UUID FK → categories | |
| amount | NUMERIC(10,2) | |
| currency | VARCHAR(3) | default 'CAD' |
| description | VARCHAR | |
| date | DATE | |
| source | ENUM('manual','receipt') | |
| receipt_id | UUID FK → receipts | nullable |
| created_at | TIMESTAMP | |

### receipts
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| image_url | VARCHAR | Cloudflare R2 URL |
| merchant | VARCHAR | extracted by OCR |
| total | NUMERIC(10,2) | extracted by OCR |
| scanned_at | TIMESTAMP | |
| raw_ocr_text | TEXT | from Google Cloud Vision |
| parsed_items | JSONB | Claude-parsed line items |

### receipt_items
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| receipt_id | UUID FK → receipts | |
| name | VARCHAR | item name |
| amount | NUMERIC(10,2) | |
| category_id | UUID FK → categories | auto-assigned |

### budgets
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| category_id | UUID FK → categories | |
| amount | NUMERIC(10,2) | monthly limit |
| period | ENUM('monthly','weekly') | |
| created_at | TIMESTAMP | |

---

## API endpoints

### Auth
- POST /api/v1/auth/register
- POST /api/v1/auth/login → returns JWT
- GET  /api/v1/auth/me

### Expenses
- GET    /api/v1/expenses          (query: ?month=2026-06&category_id=)
- POST   /api/v1/expenses
- PUT    /api/v1/expenses/{id}
- DELETE /api/v1/expenses/{id}
- GET    /api/v1/expenses/summary  (monthly totals by category)

### Receipts (OCR)
- POST /api/v1/receipts/scan       (multipart: image file)
  - checks scan quota → rejects if free user over 10/month
  - uploads image to R2
  - calls Google Cloud Vision for raw OCR text
  - calls Claude API to parse items from OCR text
  - returns parsed items for user confirmation
- POST /api/v1/receipts/{id}/confirm  (saves confirmed items as expenses)

### Categories
- GET  /api/v1/categories
- POST /api/v1/categories
- PUT  /api/v1/categories/{id}
- DELETE /api/v1/categories/{id}

### Budgets
- GET  /api/v1/budgets
- POST /api/v1/budgets
- PUT  /api/v1/budgets/{id}

### Subscriptions
- POST /api/v1/subscriptions/create-checkout  → Stripe checkout URL
- POST /api/v1/subscriptions/webhook          → Stripe webhook handler
- GET  /api/v1/subscriptions/status

---

## OCR pipeline (receipts/scan)

1. Receive image (JPEG/PNG) via multipart POST
2. Check user scan quota (free: max 10/month)
3. Upload original image to Cloudflare R2
4. Send image to Google Cloud Vision → raw text
5. Send raw text to Claude API with this prompt:

```
Extract all line items from this receipt OCR text.
Return ONLY valid JSON, no explanation:
{
  "merchant": "store name",
  "date": "YYYY-MM-DD or null",
  "total": 00.00,
  "items": [
    { "name": "item name", "amount": 0.00, "category": "Groceries|Household|Dining|Transport|Health|Other" }
  ]
}
OCR text:
{raw_ocr_text}
```

6. Return parsed JSON to frontend for user confirmation
7. On confirm: save receipt + items + auto-create expenses

---

## Scan quota logic

```python
# In receipts.py endpoint
FREE_SCAN_LIMIT = 10

def check_scan_quota(user: User):
    now = datetime.utcnow()
    # Reset counter if new month
    if user.scans_reset_at.month != now.month:
        user.scans_used_this_month = 0
        user.scans_reset_at = now
    if user.plan == 'free' and user.scans_used_this_month >= FREE_SCAN_LIMIT:
        raise HTTPException(403, "Monthly scan limit reached. Upgrade to scan unlimited receipts.")
    user.scans_used_this_month += 1
```

---

## Prototype scope (Phase 1)

Build only these features for the prototype:
1. User registration + login (JWT)
2. Manual expense entry (amount, category, date, description)
3. Expense list view with month filter
4. Category management (default system categories pre-seeded)
5. Monthly spending summary by category (simple bar chart)
6. Receipt scan flow (camera → OCR → confirm → save)
7. Scan quota display ("7 of 10 free scans used this month")

Explicitly out of scope for prototype:
- Stripe subscription / payment
- Budget tracking
- Household multi-user sharing
- Cloudflare R2 (use local file storage for prototype)
- Push notifications

---

## Coding conventions

### Frontend
- Functional components only, no class components
- Custom hooks for all API calls (e.g. `useExpenses`, `useScanReceipt`)
- TanStack Query for all server state — no raw useEffect for fetching
- Zustand only for UI state (auth token, current month filter)
- All amounts stored and passed as numbers (not strings)
- Dates as ISO strings (YYYY-MM-DD) in API, formatted with date-fns in UI
- Currency display: always CAD, formatted as `CA$0.00`
- No inline styles — Tailwind classes only

### Backend
- Async SQLAlchemy everywhere (no sync sessions)
- Pydantic schemas for all request/response bodies
- Never return raw SQLAlchemy model objects — always convert to schema
- JWT in Authorization header: `Bearer <token>`
- All endpoints require auth except /register and /login
- Environment variables via pydantic-settings (never hardcode secrets)
- 400 for validation errors, 401 for auth, 403 for quota/permission, 404 for not found

### General
- English variable/function names throughout
- TypeScript strict mode enabled
- No `any` types in TypeScript
- Python type hints on all functions

---

## Environment variables

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/expense_db
SECRET_KEY=your-jwt-secret
GOOGLE_CLOUD_VISION_API_KEY=
ANTHROPIC_API_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
```

---

## Local development

```bash
# Start backend + database
docker-compose up -d

# Backend dev server
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend dev server
cd frontend
npm install
npm run dev
```

## Phase 1 deliverable checklist
- [ ] docker-compose.yml with FastAPI + PostgreSQL
- [ ] Alembic migration for all Phase 1 tables
- [ ] Seed script for default categories
- [ ] JWT auth (register + login + /me)
- [ ] CRUD endpoints for expenses + categories
- [ ] Receipt scan endpoint (OCR pipeline)
- [ ] React app with React Router (4 pages: Login, Dashboard, Add Expense, Scan Receipt)
- [ ] Dashboard: monthly expense list + category bar chart
- [ ] Scan flow: camera capture → review parsed items → confirm
- [ ] Capacitor config for Android build
