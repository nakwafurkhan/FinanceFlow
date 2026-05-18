# FinanceFlow# 💸 FinanceFlow — Personal Finance & Budgeting Tracker

> A premium, Apple-inspired MERN stack personal finance dashboard built
> as a final-year viva-ready project.

![Stack](https://img.shields.io/badge/Stack-MERN-6366F1) ![Style](https://img.shields.io/badge/Design-Apple--inspired-10B981) ![PWA](https://img.shields.io/badge/PWA-ready-0EA5E9)

---

## ✨ Features

### Core
- **Secure JWT auth** — register / login with bcrypt-hashed passwords
- **Expense management** — full CRUD with category, date, payment method
- **Monthly budgets** — per category, with safe/warning/exceeded states
- **Analytics dashboard** — total spent, income, net cashflow, top category
- **Three charts** (Recharts) — pie (categories), bar (monthly), line (daily trend)
- **Filters & search** — by category, date range, amount range, description
- **Pagination** — server-side paginated transaction list
- **CSV + PDF export** — download your data anytime

### Bonus
- **Smart insights** — rule-based natural-language tips
- **Income tracking** — salary, freelance, refunds → net cashflow
- **Savings goals** — visual progress bars, contributions
- **Recurring expenses** — Netflix, rent, subscriptions
- **PWA support** — installable on iOS, Android, desktop
- **Dark mode** — system-aware, persistent
- **Smooth animations** — Framer Motion page + element transitions
- **Apple-style design** — glassmorphism, soft shadows, Inter typography

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios, Recharts, Framer Motion, react-hot-toast, lucide-react, vite-plugin-pwa |
| Backend | Node.js, Express 4, MongoDB Atlas, Mongoose 8, JWT, bcryptjs, dotenv, cors, morgan, pdfkit, json2csv |
| State | React Context API (Auth + Theme) |
| DB | MongoDB with aggregation pipelines |
| Auth | JWT (Bearer token) + bcrypt |

---

## 📁 Project Structure

```
financeflow/
├── client/        React + Vite frontend
│   └── src/
│       ├── api/         (axios + endpoints)
│       ├── components/  (reusable UI)
│       ├── context/     (Auth + Theme)
│       ├── pages/       (10 pages)
│       └── utils/       (formatters, constants)
├── server/        Express + MongoDB backend
│   ├── config/         (db.js)
│   ├── controllers/    (9 controllers)
│   ├── middleware/     (auth, error, validate)
│   ├── models/         (6 schemas)
│   ├── routes/         (8 routers)
│   └── utils/          (token, aggregations)
├── docs/          Viva preparation package
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- A MongoDB Atlas cluster (free tier is fine — https://cloud.mongodb.com)

### 1) Backend

```bash
cd server
cp .env.example .env
# open .env and fill MONGO_URI + JWT_SECRET
npm install
npm run seed        # optional — populates demo data
npm run dev         # starts http://localhost:5000
```

### 2) Frontend (in a second terminal)

```bash
cd client
npm install
npm run dev         # starts http://localhost:5173
```

### 3) Log in

If you ran `npm run seed`:
- **Email:** demo@financeflow.app
- **Password:** demo1234

Otherwise, click "Create one" on the login screen.

---

## 🔐 Environment Variables

`server/.env`

| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, default `30d` |
| `CLIENT_ORIGIN` | Allowed CORS origin (your frontend URL) |
| `NODE_ENV` | `development` or `production` |

---

## 🌐 API Endpoints

### Auth
| Method | Path | Body | Auth |
|---|---|---|---|
| POST | /api/auth/register | { name, email, password } | – |
| POST | /api/auth/login | { email, password } | – |
| GET | /api/auth/me | – | ✅ |
| PUT | /api/auth/me | { name?, avatarColor?, currency? } | ✅ |

### Expenses
| Method | Path | Notes |
|---|---|---|
| GET | /api/expenses | Query: category, startDate, endDate, minAmount, maxAmount, search, page, limit |
| POST | /api/expenses | { amount, category, description, date, paymentMethod } |
| GET | /api/expenses/:id | – |
| PUT | /api/expenses/:id | – |
| DELETE | /api/expenses/:id | – |

### Budgets
| Method | Path | Notes |
|---|---|---|
| GET | /api/budgets | Query: month, year — returns budgets with spent/remaining/status |
| POST | /api/budgets | Upsert by (category, month, year) |
| DELETE | /api/budgets/:id | – |

### Analytics
| Method | Path | Returns |
|---|---|---|
| GET | /api/analytics/dashboard | Headline stats |
| GET | /api/analytics/category-breakdown | Pie chart data |
| GET | /api/analytics/daily-trend | Line chart data |
| GET | /api/analytics/monthly-trend | Bar chart data |
| GET | /api/analytics/insights | Smart insights |

### Bonus
- `/api/income` — CRUD
- `/api/savings` — CRUD + POST /:id/contribute
- `/api/recurring` — CRUD
- `/api/export/csv` and `/api/export/pdf` — download files

All routes except `register` and `login` require `Authorization: Bearer <token>`.

---

## 🧠 Aggregation Pipelines (used in `utils/aggregations.js`)

| Pipeline | Stages | What it does |
|---|---|---|
| `categoryBreakdownPipeline` | `$match` → `$group` → `$sort` → `$project` | Sums expenses per category for the pie chart |
| `dailyTrendPipeline` | `$match` → `$group` (by `$dateToString`) → `$sort` | Daily totals for the line chart |
| `monthlyTrendPipeline` | `$match` → `$group` (by year + month) → `$sort` | Monthly totals for bar chart |
| `monthlySummaryPipeline` | `$match` → `$group` → `$project` | Total, count, average for dashboard |

**Why aggregation?** All the heavy math happens inside MongoDB's C++ engine
in one round-trip — far faster than fetching every document and looping in
JavaScript.

---

## 📊 Chart Choices (Recharts)

| Chart | Component | Used for |
|---|---|---|
| Donut / Pie | `<PieChart>` | Category breakdown |
| Stacked Bar | `<BarChart>` | Monthly comparison |
| Area (smooth) | `<AreaChart>` | Daily spending trend |

Apple-style design: minimal axes, soft gradients, hover tooltips with
backdrop-blur — matches Apple Health & Apple Card analytics.

---

## 🌒 Dark Mode

Tailwind's `class` strategy. The `ThemeContext` toggles a `.dark` class on
`<body>` and persists the choice in `localStorage`. Initial theme falls back
to the OS preference (`prefers-color-scheme`).

---

## 📱 PWA

Configured via `vite-plugin-pwa`. After `npm run build && npm run preview`,
the app is installable on iOS, Android, macOS, and Windows.

---

## 🚀 Deployment

### Backend → Render or Railway

1. Push your repo to GitHub.
2. On Render: **New Web Service** → connect repo → root dir `server`.
3. Set env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `NODE_ENV=production`.
4. Build command: `npm install` &nbsp;·&nbsp; Start command: `node server.js`.

### Frontend → Vercel or Netlify

1. **Vercel** → import your repo → root dir `client`.
2. Add an env var: `VITE_API_URL=https://your-backend.onrender.com/api`.
3. Build command: `npm run build` &nbsp;·&nbsp; Output dir: `dist`.

### Database → MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com.
2. Network Access → add `0.0.0.0/0` (or your server's IPs).
3. Database Access → create a user.
4. Copy the connection string into `MONGO_URI`.

---

## 🎓 Viva Preparation

See the `docs/` folder for:

- **VIVA_WALKTHROUGH.md** — Plain-English explanation of every part
- **VIVA_QA_BANK.md** — 75+ categorized Q&A
- **VIVA_CHEATSHEET.md** — Rapid-fire one-line answers
- **VIVA_MOCK_SCRIPT.md** — Simulated 15-min examiner conversation
- **CHATGPT_PROMPT.md** — Reusable prompt to ask follow-up Qs during viva

---

## 📄 License

MIT — feel free to use this for learning and portfolio purposes.
