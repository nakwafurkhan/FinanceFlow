# FinanceFlow — Server

Express + MongoDB API for the FinanceFlow personal finance tracker.

## Quick Start

```bash
cd server
cp .env.example .env       # fill in MONGO_URI + JWT_SECRET
npm install
npm run seed               # optional: seed demo data
npm run dev                # starts on http://localhost:5000
```

## Demo Login (after seeding)

- **Email:** demo@financeflow.app
- **Password:** demo1234

## API Endpoints (high level)

| Method | Path | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in |
| GET  | /api/auth/me | Current user (protected) |
| PUT  | /api/auth/me | Update profile (protected) |
| GET/POST | /api/expenses | List / create expenses |
| GET/PUT/DELETE | /api/expenses/:id | Single expense ops |
| GET/POST | /api/budgets | List / upsert monthly budgets |
| DELETE | /api/budgets/:id | Delete budget |
| GET | /api/analytics/dashboard | Headline stats |
| GET | /api/analytics/category-breakdown | Pie chart data |
| GET | /api/analytics/daily-trend | Line chart data |
| GET | /api/analytics/monthly-trend | Bar chart data |
| GET | /api/analytics/insights | Smart insights |
| GET/POST | /api/income | Income CRUD |
| GET/POST | /api/savings | Savings goals CRUD |
| POST | /api/savings/:id/contribute | Add to a goal |
| GET/POST | /api/recurring | Recurring expenses CRUD |
| GET | /api/export/csv | Download CSV |
| GET | /api/export/pdf | Download PDF |

All `/api/*` routes (except `auth/register` and `auth/login`) require an
`Authorization: Bearer <token>` header.

## Architecture

```
server/
├── config/        DB connection
├── controllers/   Business logic (one file per resource)
├── middleware/    auth + error handling + validation
├── models/        Mongoose schemas
├── routes/        Express routers
├── utils/         JWT + aggregation pipelines
├── seed.js        Demo data
└── server.js      Entry point
```
