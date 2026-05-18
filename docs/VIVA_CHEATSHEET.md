# FinanceFlow — Viva Cheat Sheet

> One-line answers to the questions that come up every time. Skim this
> 30 minutes before you walk in.

---

## The elevator pitch

> A full-stack personal finance tracker on the MERN stack with JWT auth,
> MongoDB aggregation pipelines for analytics, and a Vite-built React PWA
> styled with Tailwind.

## Stack — one line each

- **M**ongoDB — document database, schemas via Mongoose ODM
- **E**xpress — minimal Node.js web framework for the REST API
- **R**eact — UI library, component-based
- **N**ode.js — JavaScript runtime, runs the Express server
- **Vite** — frontend build tool (replaces Create React App), uses native ES modules
- **Tailwind CSS** — utility-first CSS framework
- **Framer Motion** — animation library for React
- **Recharts** — composable chart library built on React + SVG
- **JWT** — JSON Web Token for stateless auth
- **bcrypt** — password hashing (10 salt rounds)
- **PWA** — Progressive Web App, installable on phones/desktops

## The numbers

- **6 Mongoose models**: User, Expense, Budget, Income, SavingsGoal, RecurringExpense
- **8 route files** under `/api/*`
- **9 controllers**
- **10 React pages**
- **4 aggregation pipelines**: categoryBreakdown, dailyTrend, monthlyTrend, monthlySummary
- **3 chart types**: pie (categories), bar (monthly), area (daily)

## Key endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` | create account |
| POST | `/api/auth/login` | get JWT |
| GET  | `/api/auth/me` | current user (protected) |
| GET  | `/api/expenses` | list + filter + paginate |
| POST | `/api/expenses` | create |
| GET  | `/api/budgets` | with computed spent/remaining |
| GET  | `/api/analytics/dashboard` | headline numbers |
| GET  | `/api/analytics/category-breakdown` | pie data |
| GET  | `/api/export/csv` | download CSV |
| GET  | `/api/export/pdf` | download PDF |

## One-line "why" answers

- **Why MERN?** JS end-to-end, simple mental model, employable stack.
- **Why MongoDB?** Document-shaped, per-user data. Aggregation pipelines for analytics.
- **Why JWT?** Stateless — any backend instance can verify any token, no shared session storage.
- **Why bcrypt?** Industry-standard adaptive hash. Salted automatically.
- **Why aggregation pipelines?** Math runs in MongoDB's C++ engine — way faster than fetching everything and looping in JS.
- **Why Vite?** ~200ms dev startup vs CRA's ~10s. Native ES modules. CRA is deprecated.
- **Why Tailwind?** Co-located styles, easy to refactor, design tokens.
- **Why no Redux?** Auth + theme are the only global state — Context handles them. Anything more would be over-engineering.
- **Why PWA?** Installable without app stores. Basic offline support via service worker.
- **Why React Context for auth?** Simpler than Redux for one piece of global state. No reducers needed.

## Mongoose: one-liners

- **Schema** — definition of what a document looks like.
- **Model** — a constructor for documents of a schema.
- **Document** — a single record (instance of the model).
- **`pre('save')`** — a hook that runs before saving (e.g., hash the password).
- **`ref`** — links one schema to another (foreign key in spirit).
- **`populate()`** — replaces the ref id with the actual document at query time.

## React: one-liners

- **JSX** — syntactic sugar over `React.createElement()` calls.
- **Virtual DOM** — in-memory tree React diffs to compute minimal real-DOM updates.
- **Hook** — a function (`useX`) that lets functional components do stateful/side-effect things.
- **`useState`** — local component state.
- **`useEffect`** — side effects (fetches, subscriptions, DOM mutations).
- **`useContext`** — read a Context value without prop drilling.
- **Controlled component** — form input whose value is owned by React state.

## CORS in 10 seconds

Browser-enforced rule that blocks cross-origin requests by default.
Server opts in by returning `Access-Control-Allow-Origin`. Our backend
uses an allow-list via the `cors` middleware. `credentials: true` + a
specific origin lets cookies/headers pass.

## What is the difference between PUT and PATCH?

PUT replaces the whole resource. PATCH updates only the fields you
send. We use PUT for `/auth/me` (full profile replace is fine) and
PATCH semantics inside POST handlers for partial updates.

## What is the difference between auth-N and auth-Z?

- **Authentication** — "who are you?" (login, token verify)
- **Authorization** — "what are you allowed to do?" (does this expense
  belong to this user?)

In FinanceFlow, authN is the JWT verify in `protect`; authZ is the
`userId` match in every controller query.

## If you get stuck answering

- "That's a great question — let me think for a second."
- "I'm not 100% sure, but my best guess is..." → reason out loud.
- "I haven't implemented that yet, but I would approach it by..." →
  shows you can think beyond what's built.

Never bluff. Examiners can tell.

## Last-minute commands you should be able to type

```bash
# start backend
cd server && npm run dev

# start frontend
cd client && npm run dev

# seed demo data
cd server && npm run seed

# build for production
cd client && npm run build

# inspect a MongoDB collection (Atlas shell)
db.expenses.find({ userId: ObjectId("...") }).limit(5)
```

## Demo login (if you ran the seed script)

- **Email**: `demo@financeflow.app`
- **Password**: `demo1234`

Have this on a sticky note. Examiners often ask to see the app live.
