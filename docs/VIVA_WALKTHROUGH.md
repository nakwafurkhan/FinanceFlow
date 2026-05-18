# FinanceFlow — Viva Walkthrough

> A plain-English tour of FinanceFlow. Read this once end-to-end the night
> before your viva. It explains **what** every part does and **why** that
> choice was made — the "why" is what examiners reward.

---

## 1. The 30-second pitch

FinanceFlow is a personal finance dashboard. A user signs up, logs in,
records their expenses and income, sets monthly budgets per category, and
sees their financial life visualised in charts. Behind the scenes it is a
**MERN-stack web app** — MongoDB, Express, React, Node — with JWT-based
authentication, MongoDB aggregation pipelines for analytics, and a
Vite-built React frontend that doubles as an installable PWA.

If an examiner asks *"in one sentence, what is your project?"*:

> "A full-stack personal finance tracker built on the MERN stack, where the
> backend exposes a JWT-secured REST API over Express and Mongoose, and the
> frontend is a React + Vite PWA styled with Tailwind and animated with
> Framer Motion."

---

## 2. The user journey (what someone actually does in the app)

1. **Register** — the user fills in a name, email, password. The browser
   sends a `POST /api/auth/register` to the backend. The password is
   hashed with bcrypt before it ever touches the database; the response is
   a signed JWT and the public user object.
2. **Login** — `POST /api/auth/login`. The backend looks up the user by
   email, compares the supplied password against the stored bcrypt hash,
   and (if valid) returns a fresh JWT.
3. **Add an expense** — the user opens *Expenses*, fills out a form
   (amount, category, date, payment method, optional description),
   submits. The frontend attaches the JWT in the `Authorization` header
   and sends `POST /api/expenses`. The backend writes a document into the
   `expenses` collection, scoped to the logged-in user's `userId`.
4. **Set a budget** — under *Budgets*, the user picks a category, a
   month, and a target amount. `POST /api/budgets` either creates or
   updates a document keyed by `(userId, category, month, year)`. When
   the dashboard reloads, the server computes `spent` and `remaining` for
   each budget by aggregating that user's expenses for the same month.
5. **View analytics** — the *Analytics* page asks for four different
   slices of the data: a category breakdown (pie), a daily trend
   (line/area), a monthly trend (bar), and headline numbers (total,
   income, net, top category). Each one is a separate `GET
   /api/analytics/...` call that runs a MongoDB aggregation pipeline
   server-side and returns chart-ready JSON.
6. **Export** — *Settings* offers CSV and PDF exports. The backend uses
   `json2csv` to stream a CSV and `pdfkit` to render a styled PDF.

That's the whole loop.

---

## 3. The request lifecycle (what happens under the hood)

For a single API call, say "add an expense":

1. **React component** — the form submits. It calls a function in
   `client/src/api/` which uses an Axios instance with a base URL of
   `VITE_API_URL` and an interceptor that attaches `Authorization: Bearer
   <token>` from `localStorage`.
2. **Network** — request leaves the browser, hits the backend (Render in
   prod, `localhost:5000` in dev). CORS middleware checks the `Origin`
   header against `CLIENT_ORIGIN` allow-list and either accepts or
   rejects.
3. **Express** — `app.use('/api/expenses', expenseRoutes)` routes the
   request. The route file declares `router.post('/', protect,
   createExpense)`.
4. **`protect` middleware** — reads the `Authorization` header, verifies
   the JWT with `JWT_SECRET`, decodes the user's id, looks them up,
   attaches `req.user` and calls `next()`. If anything fails, it throws
   a 401.
5. **Controller** — `createExpense` validates input, constructs a new
   `Expense` document (`userId: req.user._id`, plus the form fields),
   saves it with Mongoose. Mongoose translates the call into a MongoDB
   `insertOne` over the wire.
6. **MongoDB Atlas** — writes the document, returns the inserted record.
7. **Express → JSON** — the controller responds with `res.status(201)
   .json(savedExpense)`.
8. **React** — the API helper resolves the promise; the Expenses page
   appends the new row to its state, shows a `react-hot-toast` success
   notification, and re-renders.

If anything throws along the way, the central `errorHandler`
middleware catches it and returns `{ message, stack? }` with the right
status code.

---

## 4. The layers, one at a time

### 4.1 MongoDB (the data layer)

Six collections, modeled with Mongoose schemas:

- **users** — name, email (unique), password hash, avatarColor, currency,
  timestamps. The `password` field has `select: false`, so it never comes
  back from a query unless you explicitly ask for it.
- **expenses** — userId (ref), amount, category, description, date,
  paymentMethod. Indexed on `(userId, date)` for fast filtering.
- **budgets** — userId, category, month (1–12), year, amount. A compound
  unique index on `(userId, category, month, year)` ensures one budget
  per category-month combination.
- **income** — userId, amount, source (salary/freelance/refund/other),
  date, description.
- **savingsGoals** — userId, name, targetAmount, currentAmount, deadline,
  contributions[].
- **recurringExpenses** — userId, name, amount, category, frequency
  (monthly/weekly), nextDueDate.

Why six and not three? Each is a real-world distinct concept with its
own fields and lifecycle. Trying to cram income and expense into one
"transactions" table would force a `type` discriminator that complicates
every query.

### 4.2 Express (the API layer)

Folder structure follows the standard Node convention:

```
server/
├── server.js          ← entry point, wires everything together
├── config/db.js       ← Mongoose connection
├── models/            ← Mongoose schemas (the "M")
├── routes/            ← URL → controller mapping
├── controllers/       ← business logic
├── middleware/        ← auth, error handler, validation
├── utils/             ← reusable aggregation pipelines, token helpers
└── seed.js            ← optional demo-data script
```

**Why this layout?** It enforces the *single responsibility principle*.
Routes only know about URLs; controllers only know about business logic;
models only know about data shape. If you need to change "how an
expense is created", you only touch the controller.

### 4.3 React + Vite (the frontend)

```
client/src/
├── api/             ← Axios instance + per-resource API helpers
├── components/      ← reusable UI (AppShell, ProtectedRoute, charts...)
├── context/         ← AuthContext, ThemeContext (React Context API)
├── hooks/           ← custom hooks (useExpenses, useDebounce, ...)
├── pages/           ← one component per route (Dashboard, Expenses, ...)
├── utils/           ← formatters, constants (categories, colors)
├── App.jsx          ← React Router setup with animated transitions
└── main.jsx         ← React DOM bootstrap, providers
```

- **Routing** — React Router v6. Public routes (`/login`, `/register`)
  redirect to `/` if already authenticated. Everything else is wrapped
  in `<ProtectedRoute>` which checks `useAuth()` and either renders the
  protected child or redirects to `/login`. All protected routes
  additionally live inside `<AppShell>` which provides the persistent
  sidebar and topbar.
- **State** — React Context for cross-cutting state (auth user, theme).
  Local component state for everything else (`useState`,
  `useReducer`). Why not Redux? Because Context covers the two truly
  global pieces (auth, theme), and the rest is naturally local to a
  page. Redux would be over-engineering for this app size.
- **Styling** — Tailwind CSS with the `class` dark-mode strategy. The
  `ThemeContext` toggles a `dark` class on `<body>` and persists the
  choice in `localStorage`.
- **Animations** — Framer Motion wraps each page in a `motion.div` with
  enter/exit transitions, plus `AnimatePresence` for clean
  cross-fades on route changes.
- **Charts** — Recharts. Pie chart for category breakdown, bar for
  monthly comparison, area chart for daily trend. Recharts is composable
  (it's just React components), which made theming for dark mode and
  Apple-style soft gradients straightforward.
- **PWA** — `vite-plugin-pwa` generates the service worker and
  `manifest.webmanifest` at build time. After `npm run build && npm run
  preview` the app is installable on iOS, Android, macOS, and Windows.

### 4.4 Authentication

- Passwords are hashed with **bcrypt** (10 salt rounds) via a Mongoose
  `pre('save')` hook on the User schema. The plaintext password never
  hits disk.
- JWTs are signed with `JWT_SECRET` and a 30-day expiry. They contain
  only the user's id; the backend looks up everything else on each
  request.
- The `protect` middleware reads `Authorization: Bearer <token>`,
  verifies the JWT, and loads the user. If verification or lookup
  fails, the request short-circuits with 401.
- The frontend stores the token in `localStorage`. This is a deliberate
  trade-off: localStorage tokens are vulnerable to XSS; cookies with
  `HttpOnly` would be vulnerable to CSRF unless we add SameSite tokens.
  For a single-page React app on a single trusted domain, localStorage
  is a reasonable default; in a higher-stakes app I'd switch to
  `HttpOnly` cookies + CSRF protection.

### 4.5 Analytics with MongoDB aggregation pipelines

The analytics endpoints don't pull every expense down and loop in
JavaScript. Instead, they delegate the math to MongoDB:

```js
// utils/aggregations.js (shortened)
const categoryBreakdownPipeline = (userId, month, year) => ([
  { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
  { $group: { _id: '$category', total: { $sum: '$amount' } } },
  { $sort: { total: -1 } },
  { $project: { _id: 0, category: '$_id', total: 1 } },
]);
```

Four pipelines:
1. **categoryBreakdown** — `$match` + `$group` + `$sort` for the pie
   chart.
2. **dailyTrend** — `$match` + `$group` (bucketed by `$dateToString`)
   for the line/area chart.
3. **monthlyTrend** — `$match` + `$group` (bucketed by year+month) for
   the bar chart.
4. **monthlySummary** — `$match` + `$group` + `$project` to compute
   total, count, average.

**Why aggregate server-side?** Three reasons:
1. **Speed** — MongoDB's aggregation runs in C++ on indexed data. Doing
   the same work in JavaScript on the Node side is at least an order of
   magnitude slower.
2. **Bandwidth** — instead of shipping every expense document to the
   server (and from server to client), we ship one tiny pre-aggregated
   array.
3. **Atomicity** — the pipeline sees a consistent snapshot of the
   collection.

---

## 5. Design decisions and trade-offs

These are the questions examiners love.

### Why MERN?
JavaScript end-to-end keeps the mental model simple — same language for
client, server, and data layer (JSON). It's also one of the most
employable stacks for an entry-level developer.

### Why MongoDB instead of PostgreSQL?
The data is **per-user, document-shaped**, and most queries are
"give me my expenses for this filter". A document store fits naturally,
and aggregation pipelines handle the analytics workload. A relational
schema would work too, but adds JOIN complexity for not much gain at
this scale.

### Why JWT instead of sessions?
Stateless auth lets the API scale horizontally — any backend instance
can verify any token without shared session storage. Sessions would
require Redis or sticky load balancing. For an SPA + REST API, JWT is
the standard.

### Why Vite instead of Create-React-App?
Vite uses native ES modules in dev — startup is ~200ms instead of CRA's
~10s, and HMR is near-instant. CRA is also being deprecated.

### Why server-side aggregations instead of client-side?
See section 4.5 — speed, bandwidth, and atomicity.

### Why no Redux?
Auth and theme are the only truly global state. Context handles them
cleanly. Adding Redux would mean boilerplate (actions, reducers,
selectors, middlewares) for no real win at this app size. If the app
grew to ~30 pages with deeply shared data, I'd reach for Zustand or
React Query before Redux.

### Why PWA?
Free conversion-killer-killer: users can install the app on their
phone with no app-store friction. The service worker also gives basic
offline support for already-loaded screens.

### Why Tailwind?
Utility-first CSS keeps styles co-located with markup, which makes
components easier to delete and refactor. The design language
(Apple-inspired: soft shadows, generous spacing, Inter typography)
maps cleanly onto Tailwind's design tokens.

---

## 6. What I'd do next (the "growth" answer)

If asked *"what would you improve?"*, here are honest answers in
priority order:

1. **Add tests.** Jest + Supertest for the backend, Vitest + React
   Testing Library for the frontend. The fact that there are none right
   now is a real gap.
2. **Type safety.** Migrate to TypeScript. The biggest gains would be in
   the API contract between client and server.
3. **Refresh tokens.** A 30-day access token is convenient but
   exposed. Short-lived access tokens + refresh tokens stored in
   `HttpOnly` cookies would be more secure.
4. **Rate limiting.** Add `express-rate-limit` on `/api/auth/*` to slow
   credential-stuffing attacks.
5. **Multi-currency support.** Currency is a per-user setting but the
   numbers themselves are stored without a currency stamp.
6. **CI/CD.** GitHub Actions running lint + tests on every PR.
7. **Observability.** Structured logging (Pino) and an error tracker
   (Sentry).
8. **A real recurring-expenses cron** — currently the model exists but
   recurring expenses don't auto-post; that would need a scheduler
   (BullMQ + Redis, or Render cron jobs).

---

## 7. Things that almost always come up

- **"How is the password stored?"** — bcrypt hash with 10 salt rounds.
  Never plaintext. `select: false` on the field so it doesn't leak.
- **"What is JWT?"** — a signed token containing claims. Signed with
  `JWT_SECRET` (HMAC SHA-256). Anyone can read it; only the server can
  *forge* it.
- **"What is an aggregation pipeline?"** — a sequence of stages
  (`$match`, `$group`, `$sort`, `$project`, ...) that MongoDB executes
  in order on a collection.
- **"What is the difference between SQL and NoSQL?"** — SQL uses
  relational tables with strict schemas and JOINs; NoSQL (here:
  document store) stores JSON-like documents with flexible schemas and
  no JOINs. Different trade-offs, neither is strictly better.
- **"How does React re-render?"** — when state or props change, React
  schedules a re-render of that component. The virtual DOM diffs old
  vs new, and only the actually-changed nodes touch the real DOM.
- **"What is the virtual DOM?"** — an in-memory tree of plain JS
  objects describing what the UI should look like. Cheaper to diff
  than the real DOM, so React batches changes through it.

---

## 8. Final tips for the viva itself

- **Show, don't tell.** When asked something, open the relevant file
  on your laptop. Pointing at real code beats reciting from memory.
- **Pause before answering complex questions.** A 3-second pause +
  structured answer beats a rushed one.
- **If you don't know something, say so.** "I'm not 100% sure, but my
  guess is..." plus reasoning beats bluffing.
- **Have the README open.** It's your map.
- **Have one screen showing the running app.** Examiners love being
  able to ask "click that".

Good luck. You built this; you know it better than anyone in the room.
