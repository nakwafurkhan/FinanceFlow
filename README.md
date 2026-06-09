<div align="center">

# 💸 FinanceFlow

### Personal Finance & Budgeting Tracker

**A premium MERN-stack dashboard with JWT auth, MongoDB aggregation
analytics, AI-powered insights, dark mode, and installable PWA support —
designed end-to-end with an Apple-inspired aesthetic.**

[![Stack](https://img.shields.io/badge/Stack-MERN-6366F1?style=flat-square)](https://www.mongodb.com/mern-stack)
[![AI](https://img.shields.io/badge/AI-Llama_3.3_70B-8B5CF6?style=flat-square)](https://groq.com)
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

The fastest way. A seeded demo account is loaded with three months of
sample expenses, budgets, income, savings goals, and recurring items so
you can click around immediately — including the AI insights panel.

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
#   (optional) OPENAI_API_KEY + OPENAI_BASE_URL + OPENAI_MODEL to enable AI
npm install
npm run seed    # optional: populates 3 months of demo data
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

## 🤖 AI insights & chat

FinanceFlow ships with an **AI financial assistant** built into the
dashboard. It does two things, both grounded in *your own* data:

1. **Auto-generated insight cards** — concise, specific observations like
   *"Bills exceeded limit by ₹3,359"* or *"Savings rate is 60% of income."*
2. **Chat** — ask free-form questions (*"Where is most of my money going?"*)
   and get answers computed from your real spending, not hallucinated.

**How it stays accurate and cheap:**

- The server computes a compact financial summary with MongoDB aggregations
  (category totals, budgets vs. spent, last 10 transactions) and passes it
  as grounded context — the model only *interprets* data we hand it.
- **Provider-agnostic**: built on the OpenAI SDK, so it works with any
  OpenAI-compatible API via a single `OPENAI_BASE_URL` env var. The live
  demo runs on **Groq's free tier (Llama 3.3 70B)**; swap to Google Gemini,
  OpenRouter, or OpenAI by changing env vars only — no code change.
- **Graceful degradation**: with no API key configured, the endpoints return
  `configured: false` and the UI shows an "almost ready" card instead of
  crashing — the app is always safe to deploy.
- **Rate-limited** to 20 AI requests / 15 min / IP, since LLM calls cost money.

---

## 📸 Screenshots

> 👉 **The best way to see FinanceFlow is the
> [live demo](https://finance-flow-theta-indol.vercel.app)** — log in with
> the demo credentials above and click around the populated dashboard,
> analytics, budgets, and AI panel.

<details>
<summary>📷 Adding screenshots to this README (maintainer note)</summary>

Drop PNGs at `client/public/screenshots/` with these filenames and they'll
render in the grid below automatically:

| File | View | Recommended size |
|---|---|---|
| `dashboard.png` | Dashboard (populated) | 1440×900 |
| `analytics.png` | Analytics charts | 1440×900 |
| `budgets.png` | Budgets page | 1440×900 |
| `ai-panel.png` | AI insights + chat | 1440×900 |
| `mobile.png` | Mobile / PWA view | 390×844 |

Then replace this block with the image grid. Capture them from the live
demo while logged in as the demo user.

</details>

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
- 📥 **CSV + PDF export** — download a branded report anytime (json2csv + pdfkit)

### AI
- 🤖 **AI insights** — data-grounded insight cards generated from your finances
- 💬 **AI chat** — ask natural-language questions about your spending
- 🔌 **Provider-agnostic** — OpenAI-compatible; runs on Groq (Llama 3.3 70B) for free

### Bonus
- 💡 **Smart insights** — rule-based natural-language tips (works without AI)
- 💰 **Income tracking** — salary, freelance, refunds → net cashflow
- 🎯 **Savings goals** — visual progress bars and contribution tracking
- 🔁 **Recurring expenses** — Netflix, rent, subscriptions
- 📱 **PWA support** — installable on iOS, Android, macOS, Windows
- 🌙 **Dark mode** — system-aware, persistent
- 🎬 **Smooth animations** — Framer Motion page + element transitions

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios, Recharts, Framer Motion, react-hot-toast, lucide-react, vite-plugin-pwa |
| **Backend** | Node.js, Express 4, MongoDB Atlas, Mongoose 8, JWT, bcryptjs, compression, express-rate-limit, dotenv, cors, morgan, pdfkit, json2csv |
| **AI** | OpenAI SDK (provider-agnostic) · Groq / Llama 3.3 70B by default · swappable via `OPENAI_BASE_URL` |
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
                  │  ┌───────────────────┐  │      ┌──────────────────┐
                  │  │ protect (JWT)     │  │      │  OpenAI-compatible│
                  │  │ controllers       │──┼─────▶│  LLM (Groq /      │
                  │  │ aggregation utils │  │      │  Gemini / OpenAI) │
                  │  └─────────┬─────────┘  │      └──────────────────┘
                  └────────────┼────────────┘
                               │ Mongoose
                  ┌────────────▼────────────┐
                  │    MongoDB Atlas        │
                  │    6 collections        │
                  └─────────────────────────┘
```

The AI controller builds a grounded context from MongoDB aggregations and
sends only that summary to the LLM — never raw bulk data.

---

## 📁 Project Structure

```
financeflow/
├── client/                React + Vite frontend (deployed to Vercel)
│   └── src/
│       ├── api/           Axios instance + per-resource endpoints (incl. aiApi)
│       ├── components/    AppShell, ProtectedRoute, AiInsights, reusable UI
│       ├── context/       Auth + Theme React Contexts
│       ├── hooks/         Custom hooks (useConfirm, useMediaQuery)
│       ├── pages/         Landing + 10 routed app pages
│       ├── utils/         Formatters, constants
│       ├── App.jsx        Router + animated transitions
│       └── main.jsx       React entry point
│
├── server/                Express + MongoDB backend (deployed to Render)
│   ├── config/db.js       Mongoose connection
│   ├── controllers/       10 controllers (incl. aiController)
│   ├── middleware/        auth, errorMiddleware, validate
│   ├── models/            6 Mongoose schemas
│   ├── routes/            9 route files mounted under /api/*
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
| `OPENAI_API_KEY` | *(optional)* enables AI insights/chat. A free Groq key works. |
| `OPENAI_BASE_URL` | *(optional)* e.g. `https://api.groq.com/openai/v1` for Groq |
| `OPENAI_MODEL` | *(optional)* e.g. `llama-3.3-70b-versatile` (defaults to `gpt-4o-mini`) |

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
| `GET` | `/api/analytics/insights` | Smart (rule-based) insights |

### AI
| Method | Path | Returns |
|---|---|---|
| `GET`  | `/api/ai/status` | `{ configured, model }` — cheap check, no LLM call |
| `GET`  | `/api/ai/insights` | AI-generated, data-grounded insight cards |
| `POST` | `/api/ai/chat` | `{ reply }` for a free-form question (body: `{ message, history? }`) |

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
fetching every document and looping in JavaScript. The same aggregated
summaries also ground the AI assistant.

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
   - *(optional, enables AI)* `OPENAI_API_KEY`, `OPENAI_BASE_URL`
     (`https://api.groq.com/openai/v1`), `OPENAI_MODEL`
     (`llama-3.3-70b-versatile`)
7. Confirm `https://your-app.onrender.com/api/health` returns
   `{ ok: true, aiEnabled: ... }`.

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

- [x] **AI insights & chat** — provider-agnostic LLM assistant (live, on Groq)
- [x] **Rate limiting** (`express-rate-limit`) on `/api/auth/*` and `/api/ai/*`
- [x] **gzip compression** + cache headers + bundle code-splitting
- [ ] Automated tests (Jest + Supertest for backend, Vitest + RTL for frontend)
- [ ] Migrate to TypeScript
- [ ] Short-lived access tokens + refresh tokens in HttpOnly cookies
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
auth, CRUD, aggregation pipelines, charts, exports, a provider-agnostic
AI assistant, PWA, and modern deployment practices.

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
