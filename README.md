<div align="center">

# 💸 FinanceFlow

### Personal Finance & Budgeting Tracker

**A premium MERN-stack dashboard with JWT auth, MongoDB aggregation
analytics, dark mode, and installable PWA support — designed
end-to-end with an Apple-inspired aesthetic.**

[![Stack](https://img.shields.io/badge/Stack-MERN-6366F1?style=flat-square)](https://www.mongodb.com/mern-stack)
[![Design](https://img.shields.io/badge/Design-Apple--inspired-8B5CF6?style=flat-square)](https://developer.apple.com/design/human-interface-guidelines/)
[![PWA](https://img.shields.io/badge/PWA-ready-10B981?style=flat-square)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-F59E0B?style=flat-square)](./LICENSE)
[![Author](https://img.shields.io/badge/Author-@nakwafurkhan-1f2937?style=flat-square&logo=github)](https://github.com/nakwafurkhan)

[**▶ Live Demo**](https://finance-flow-theta-indol.vercel.app) ·
[**📖 Documentation**](./docs) ·
[**🐛 Report Bug**](https://github.com/nakwafurkhan/FinanceFlow/issues)

</div>

---

## 🚀 How to use it

There are two ways to try FinanceFlow — pick whichever fits your time budget.

### Option A — Use the live demo (30 seconds)

The fastest way. A seeded demo account is loaded with a full month of
sample expenses, budgets, and income so you can click around immediately.

> 🔗 **Open the live app**: **[finance-flow-theta-indol.vercel.app](https://finance-flow-theta-indol.vercel.app)**
>
> 🧪 **Demo credentials** (pre-filled on the login form):
>   - **Email**: `demo@financeflow.app`
>   - **Password**: `demo1234`

> ⏱ **A note on the first load**: the backend runs on Render's free tier
> and sleeps after 15 minutes of inactivity. If you're the first visitor in
> a while, the first API call (e.g. login) takes ~30 seconds while the
> Node process wakes up. Subsequent calls are fast.

### Option B — Run it locally (5 minutes)

You'll need **Node.js 18+**, **npm**, and a free **MongoDB Atlas** cluster.

**1. Clone the repo**

```bash
git clone https://github.com/nakwafurkhan/FinanceFlow.git
cd FinanceFlow
```

**2. Start the backend** (terminal 1)

```bash
cd server
cp .env.example .env
# Open .env and fill in:
#   MONGO_URI   → your Atlas connection string
#   JWT_SECRET  → run: openssl rand -hex 32
npm install
npm run seed    # optional: populates demo data
npm run dev     # → http://localhost:8080
```

**3. Start the frontend** (terminal 2)

```bash
cd client
echo "VITE_API_URL=http://localhost:8080/api" > .env
npm install
npm run dev     # → http://localhost:5173
```

**4. Open the app**

Visit [http://localhost:5173](http://localhost:5173) and sign in
(if you ran the seed) with `demo@financeflow.app` / `demo1234`, or
click "Create one" on the login screen.

---

## 📸 Screenshots

<div align="center">

| Dashboard | Analytics | Budgets |
|:---:|:---:|:---:|
| ![Dashboard](./client/public/screenshots/dashboard.png) | ![Analytics](./client/public/screenshots/analytics.png) | ![Budgets](./client/public/screenshots/budgets.png) |

| Expenses (light) | Expenses (dark) | Mobile / PWA |
|:---:|:---:|:---:|
| ![Expenses Light](./client/public/screenshots/expenses-light.png) | ![Expenses Dark](./client/public/screenshots/expenses-dark.png) | ![Mobile](./client/public/screenshots/mobile.png) |

</div>

> 🛈 **Maintainer note**: drop your screenshots at
> `client/public/screenshots/` with the filenames above and they'll render
> automatically. Recommended size: 1440×900 desktop, 390×844 mobile.

---

## ✨ Features

### Core
- 🔒 **Secure JWT auth** — register / login with bcrypt-hashed passwords (10 salt rounds)
- 💸 **Expense management** — full CRUD with category, date, payment method
- 📊 **Monthly budgets** — per category, with safe / warning / exceeded states
- 📈 **Analytics dashboard** — total spent, income, net cashflow, top category
- 🎨 **Three chart types** (Recharts) — pie (categories), bar (monthly), area (daily)
- 🔎 **Filters & search** — by category, date range, amount range, description
- 📑 **Server-side pagination** — fast even with thousands of expenses
- 📥 **CSV + PDF export** — download your data anytime (json2csv + pdfkit)

### Bonus
- 💡 **Smart insights** — rule-based natural-language tips
- 💰 **Income tracking** — salary, freelance, refunds → net cashflow
- 🎯 **Savings goals** — visual progress bars and contribution tracking
- 🔁 **Recurring expenses** — Netflix, rent, subscriptions
- 📱 **PWA support** — installable on iOS, Android, macOS, Windows
- 🌙 **Dark mode** — system-aware, persistent
- 🎬 **Smooth animations** — Framer Motion page + element transitions
- 🤖 **AI insights** *(coming soon)* — OpenAI-powered spending Q&A

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios, Recharts, Framer Motion, react-hot-toast, lucide-react, vite-plugin-pwa |
| **Backend** | Node.js, Express 4, MongoDB Atlas, Mongoose 8, JWT, bcryptjs, dotenv, cors, morgan, pdfkit, json2csv |
| **State** | React Context API (Auth + Theme) |
| **Database** | MongoDB with aggregation pipelines |
| **Auth** | JWT (Bearer token) + bcrypt |
| **Hosting** | Vercel (frontend) · Render (backend) · MongoDB Atlas (database) |

---

## 🏗️ Architecture

```
                  ┌─────────────────────────┐
                  │   Browser (PWA-ready)   │
                  └────────────┬────────────┘
                               │ HTTPS + JWT
                  ┌────────────▼────────────┐
                  │   Vercel CDN (static)   │
                  │   React + Vite build    │
                  └────────────┬────────────┘
                               │ /api/* (Axios)
                  ┌────────────▼────────────┐
                  │      Render (Node)      │
                  │  Express + middleware   │
                  │  ┌───────────────────┐  │
                  │  │ protect (JWT)     │  │
                  │  │ controllers       │  │
                  │  │ aggregation utils │  │
                  │  └─────────┬─────────┘  │
                  └────────────┼────────────┘
                               │ Mongoose
                  ┌────────────▼────────────┐
                  │    MongoDB Atlas        │
                  │    6 collections        │
                  └─────────────────────────┘
```

---

## 📁 Project Structure

```
financeflow/
├── client/                React + Vite frontend (deployed to Vercel)
│   └── src/
│       ├── api/           Axios instance + per-resource endpoints
│       ├── components/    AppShell, ProtectedRoute, reusable UI
│       ├── context/       Auth + Theme React Contexts
│       ├── hooks/         Custom hooks (useInView, useMediaQuery)
│       ├── pages/         Landing + 10 routed app pages
│       ├── utils/         Formatters, constants
│       ├── App.jsx        Router + animated transitions
│       └── main.jsx       React entry point
│
├── server/                Express + MongoDB backend (deployed to Render)
│   ├── config/db.js       Mongoose connection
│   ├── controllers/       9 controllers (one per resource)
│   ├── middleware/        auth, errorMiddleware, validate
│   ├── models/            6 Mongoose schemas
│   ├── routes/            8 route files mounted under /api/*
│   ├── utils/             token, aggregation pipelines
│   ├── server.js          Entry point
│   └── seed.js            Optional demo-data seeder
│
├── docs/                  Viva preparation package
│   ├── VIVA_WALKTHROUGH.md
│   ├── VIVA_QA_BANK.md
│   ├── VIVA_CHEATSHEET.md
│   ├── VIVA_MOCK_SCRIPT.md
│   └── CHATGPT_PROMPT.md
│
├── .gitignore
├── LICENSE
└── README.md              ← you are here
```

---

## 🔐 Environment Variables

### `server/.env`

| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000, set to 8080 locally) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign JWTs (use `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | Token lifetime, default `30d` |
| `CLIENT_ORIGIN` | Allowed CORS origin(s), comma-separated |
| `NODE_ENV` | `development` or `production` |

### `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g., `http://localhost:8080/api` locally, `https://your-backend.onrender.com/api` in production) |

---

## 🌐 API Reference

All routes except `/api/auth/register` and `/api/auth/login` require
`Authorization: Bearer <token>`.

### Auth
| Method | Path | Body | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{ name, email, password }` | – |
| `POST` | `/api/auth/login` | `{ email, password }` | – |
| `GET`  | `/api/auth/me` | – | ✅ |
| `PUT`  | `/api/auth/me` | `{ name?, avatarColor?, currency? }` | ✅ |

### Expenses
| Method | Path | Notes |
|---|---|---|
| `GET`    | `/api/expenses` | Query: `category, startDate, endDate, minAmount, maxAmount, search, page, limit` |
| `POST`   | `/api/expenses` | `{ amount, category, description, date, paymentMethod }` |
| `GET`    | `/api/expenses/:id` | – |
| `PUT`    | `/api/expenses/:id` | – |
| `DELETE` | `/api/expenses/:id` | – |

### Budgets
| Method | Path | Notes |
|---|---|---|
| `GET`    | `/api/budgets` | Query: `month, year` — returns budgets with `spent`/`remaining`/`status` |
| `POST`   | `/api/budgets` | Upsert by `(category, month, year)` |
| `DELETE` | `/api/budgets/:id` | – |

### Analytics
| Method | Path | Returns |
|---|---|---|
| `GET` | `/api/analytics/dashboard` | Headline stats |
| `GET` | `/api/analytics/category-breakdown` | Pie chart data |
| `GET` | `/api/analytics/daily-trend` | Line/area chart data |
| `GET` | `/api/analytics/monthly-trend` | Bar chart data |
| `GET` | `/api/analytics/insights` | Smart insights |

### Bonus
- `/api/income` — CRUD
- `/api/savings` — CRUD + `POST /:id/contribute`
- `/api/recurring` — CRUD
- `/api/export/csv` and `/api/export/pdf` — file downloads

---

## 🧠 Aggregation Pipelines

All analytics endpoints delegate the heavy math to MongoDB via
aggregation pipelines (`server/utils/aggregations.js`):

| Pipeline | Stages | Purpose |
|---|---|---|
| `categoryBreakdownPipeline` | `$match → $group → $sort → $project` | Sums expenses per category (pie) |
| `dailyTrendPipeline` | `$match → $group → $sort` | Daily totals (line/area) |
| `monthlyTrendPipeline` | `$match → $group → $sort` | Monthly totals (bar) |
| `monthlySummaryPipeline` | `$match → $group → $project` | Total + count + avg (dashboard) |

**Why aggregate?** MongoDB's C++ engine processes pipelines over
indexed data in one round trip — orders of magnitude faster than
fetching every document and looping in JavaScript.

---

## 🚢 Deployment

### Database — MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Network Access → add `0.0.0.0/0` (or your server IPs).
3. Database Access → create a user with **a strong autogenerated password**.
4. Copy the connection string into `MONGO_URI`.

### Backend — Render

1. **New** → **Web Service** → connect this repo.
2. **Root Directory**: `server`
3. **Build Command**: `npm install`
4. **Start Command**: `node server.js`
5. **Environment**: Node
6. **Env Vars**:
   - `MONGO_URI` — your Atlas connection string
   - `JWT_SECRET` — `openssl rand -hex 32` output (do **not** reuse dev secret)
   - `JWT_EXPIRES_IN` — `30d`
   - `CLIENT_ORIGIN` — your Vercel URL (after frontend deploy)
   - `NODE_ENV` — `production`
7. Confirm `https://your-app.onrender.com/api/health` returns `{ ok: true }`.

### Frontend — Vercel

1. Import this repo at [vercel.com/new](https://vercel.com/new).
2. **Root Directory**: `client`
3. **Framework Preset**: Vite (auto-detected)
4. **Env Var**: `VITE_API_URL` → `https://your-backend.onrender.com/api`
5. Deploy. Then go back to Render and update `CLIENT_ORIGIN` to your
   `https://your-app.vercel.app`.

---

## 🎓 Viva Preparation

The [`docs/`](./docs) folder contains a complete viva-prep package:

- **[VIVA_WALKTHROUGH.md](./docs/VIVA_WALKTHROUGH.md)** — plain-English tour of every part
- **[VIVA_QA_BANK.md](./docs/VIVA_QA_BANK.md)** — 85 categorised examiner-style questions with model answers
- **[VIVA_CHEATSHEET.md](./docs/VIVA_CHEATSHEET.md)** — one-line answers for last-minute review
- **[VIVA_MOCK_SCRIPT.md](./docs/VIVA_MOCK_SCRIPT.md)** — simulated 15-minute examiner conversation
- **[CHATGPT_PROMPT.md](./docs/CHATGPT_PROMPT.md)** — reusable LLM prompt for self-quizzing

---

## 🗺️ Roadmap

- [ ] **AI insights** — OpenAI-powered conversational assistant for spending Q&A
- [ ] Automated tests (Jest + Supertest for backend, Vitest + RTL for frontend)
- [ ] Migrate to TypeScript
- [ ] Short-lived access tokens + refresh tokens in HttpOnly cookies
- [ ] Rate limiting (`express-rate-limit`) on `/api/auth/*`
- [ ] Multi-currency support with daily FX rates
- [ ] Recurring-expense auto-posting via scheduler
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Observability — Pino structured logs + Sentry

---

## 👤 About the author

<div align="center">

### Nakwa Furkhan
**Full-stack developer · MERN · Designer-engineer**

[![GitHub](https://img.shields.io/badge/GitHub-@nakwafurkhan-1f2937?style=for-the-badge&logo=github)](https://github.com/nakwafurkhan)
[![FinanceFlow](https://img.shields.io/badge/Star_this_project-6366F1?style=for-the-badge&logo=github)](https://github.com/nakwafurkhan/FinanceFlow)

FinanceFlow is my final-year MERN portfolio project — designed,
engineered, and deployed end-to-end. Built to demonstrate the full stack:
auth, CRUD, aggregation pipelines, charts, exports, PWA, and modern
deployment practices.

If you found this useful, **please give the repo a ⭐** — it helps a lot.
And if you're hiring junior or new-grad full-stack developers, I'd love
to chat.

</div>

---

## 📄 License

[MIT](./LICENSE) — free to use for learning, portfolio, and commercial purposes.

---

<div align="center">

Built with ☕ and curiosity · © 2026 [Nakwa Furkhan](https://github.com/nakwafurkhan)

</div>
