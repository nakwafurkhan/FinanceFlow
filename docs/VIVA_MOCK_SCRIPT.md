# FinanceFlow — Mock Viva Script

> A simulated 15-minute examiner conversation. Read it as a rehearsal —
> the student's responses are deliberately imperfect (some pauses, some
> "I think..."), because that's how real vivas sound. The examiner
> escalates from easy → medium → hard, with one trade-off question and
> one stretch question at the end.

---

**Setting**: Final-year computer-science viva. You've already opened
your laptop, started the dev server, and have the GitHub repo on screen.
The examiner has skimmed your README.

---

### Part 1 — Warm-up (minutes 0–3)

**Examiner**: Right, let's start easy. In one or two sentences, what is
this project?

**Student**: FinanceFlow is a personal finance and budgeting tracker
built on the MERN stack — MongoDB, Express, React, Node. Users sign up,
record their expenses and income, set monthly budgets, and see their
finances visualised in charts. The whole thing also installs as a
Progressive Web App.

**Examiner**: Good. Why did you build this and not something else?

**Student**: Two reasons. One — personal finance is something I
actually need to track myself, so I knew the domain. Two — it
exercises the full MERN stack: auth, CRUD, complex queries with
aggregation pipelines, charts, exports, dark mode. Almost every
backend and frontend concept I learned shows up somewhere.

**Examiner**: Show me the running app.

**Student**: *(switches to the app, logs in as the demo user)*. This is
the dashboard — total spent, income, net cashflow, top category.
*(clicks Expenses)* — full CRUD with filters, search, pagination.
*(clicks Budgets)* — monthly budgets per category with the safe /
warning / exceeded states. *(clicks Analytics)* — pie chart for
categories, bar chart for monthly trend, area chart for daily
spending.

**Examiner**: Nice — the charts respond well. What library?

**Student**: Recharts. It's composable React components built on SVG,
which made it easy to theme for dark mode and to apply the soft
Apple-style gradients on the tooltips.

---

### Part 2 — Architecture & data (minutes 3–7)

**Examiner**: Walk me through what happens when you add an expense.
Be specific.

**Student**: Sure. The form submits, which calls an Axios helper in
`client/src/api/expenses.js`. The Axios instance has a base URL of
`VITE_API_URL` and an interceptor that attaches the JWT from
localStorage as a Bearer token. The request hits Express at
`POST /api/expenses`, passes the CORS allow-list check, gets routed
to the expense router, and runs through the `protect` middleware.

That middleware reads the Authorization header, verifies the JWT
against `JWT_SECRET`, decodes the user id, loads the user from
MongoDB, and attaches them to `req.user`. Then the
`createExpense` controller picks up `req.body`, validates the
required fields, constructs a new `Expense` document with
`userId: req.user._id`, and saves it. Mongoose translates that into
a MongoDB `insertOne`. The controller responds with 201 plus the
saved document.

On the frontend, the Axios promise resolves, the page state appends
the new expense, react-hot-toast shows a success notification, and
React re-renders.

**Examiner**: How is the password actually stored?

**Student**: Bcrypt hash with 10 salt rounds. There's a `pre('save')`
hook on the User schema that runs before every save — if the
password field was modified, it calls `bcrypt.hash` on it and stores
the result. Plaintext never touches the database. The `password`
field also has `select: false`, so queries don't return the hash by
default.

**Examiner**: Why bcrypt and not, say, SHA-256?

**Student**: SHA-256 is too fast for password hashing — attackers
can compute billions of hashes a second on a GPU. Bcrypt is
deliberately slow, with a tunable cost factor — 10 salt rounds takes
about 100ms, which is fine for a login request but multiplies the
cost of brute force by a huge factor. It also handles per-password
salting automatically.

**Examiner**: What if I steal your database dump tomorrow?

**Student**: They'd have the bcrypt hashes, not the passwords. With
10 rounds of bcrypt, they're looking at significant time and cost
to brute force any single password. Strong passwords would be
essentially uncrackable; weak ones (`password123`) would still fall
to dictionary attacks. Standard mitigations beyond bcrypt would be
password-strength requirements, breach checking against
HaveIBeenPwned, and rate limiting on login.

---

### Part 3 — Database design (minutes 7–10)

**Examiner**: Why MongoDB and not PostgreSQL?

**Student**: Two reasons specific to this project. First, the data is
per-user and document-shaped — most queries are "give me this user's
expenses for these filters", which doesn't benefit from JOINs.
Second, I'm using aggregation pipelines heavily for analytics, and
MongoDB's pipelines are powerful and fast. Postgres would have worked
— I'd use window functions for the analytics — but Mongo fit the
shape better.

**Examiner**: Why are expenses a separate collection from users? Why
not just embed an `expenses` array inside the user document?

**Student**: Two reasons. One — MongoDB documents are capped at 16 MB,
and expenses are unbounded; a heavy user could blow that limit. Two —
embedding would mean every new expense rewrites the entire user
document, which is expensive on writes. The reference pattern (a
`userId` field on each expense) is the right shape for unbounded
child data.

**Examiner**: Show me one of your aggregation pipelines.

**Student**: *(opens `server/utils/aggregations.js`)*. Here's the
category breakdown — used for the pie chart. Stage one is `$match`,
which filters by `userId` and date range. Stage two is `$group`,
which sums the `amount` field grouped by `category`. Stage three is
`$sort` by total descending. Stage four is `$project`, which
reshapes the output to `{ category, total }` and drops the `_id`.
All four stages run inside MongoDB's C++ engine on indexed data, in
one network round trip.

**Examiner**: Why not just fetch every expense and sum them in
JavaScript?

**Student**: Three reasons. Speed — MongoDB does this in C++ over
indexes, way faster than JS. Bandwidth — we ship one tiny aggregated
array instead of thousands of raw documents. And atomicity — the
pipeline sees a consistent snapshot of the collection at one point
in time. For a thousand expenses it wouldn't matter; at scale, it's
the difference between snappy and unusable.

**Examiner**: What indexes do you have?

**Student**: A unique index on `users.email` for fast login lookups.
A compound index on `expenses` for `(userId, date)` because almost
every expense query filters by user and sorts by date. And a
compound *unique* index on `budgets` for `(userId, category, month,
year)`, which enforces the "one budget per category per month" rule
at the database level instead of relying on application code.

---

### Part 4 — Trade-offs (minutes 10–13)

**Examiner**: You store the JWT in `localStorage`. That's a security
risk. Defend it.

**Student**: It's a trade-off. localStorage is vulnerable to XSS —
any injected script can read the token. The alternative, HttpOnly
cookies, is vulnerable to CSRF unless you add explicit CSRF tokens
and SameSite handling. For a single-page React app on a single
trusted domain, localStorage is a defensible default — *if* I'm
also careful about XSS, which means escaping user input properly,
using React's built-in escaping (which I do — no `dangerouslySetIn-
nerHTML` anywhere), and adding a Content Security Policy in
production.

If I were rebuilding this for a higher-stakes context — banking,
healthcare — I'd switch to short-lived access tokens (~15 min) in
memory, with refresh tokens in HttpOnly + SameSite=Strict cookies,
plus CSRF tokens.

**Examiner**: You said "no Redux." How will you justify that if your
app grows?

**Student**: Right now I only have two pieces of global state — auth
user and theme — which Context handles fine. The issue with Context
at scale is that any change to the Provider re-renders every
consumer, even if they only care about one field. So if the app
grew to thirty pages with deeply shared mutable state — say a notion-
like multi-page editor — I'd reach for Zustand or Jotai before
Redux, because they have a small mental footprint and avoid the
unnecessary re-render problem. Redux only makes sense for me when I
actually need the redux-devtools time-travel debugging or a complex
middleware pipeline.

**Examiner**: You have no tests. How do you know it works?

**Student**: Honest answer — I don't, not in any automated way. I've
manually tested every feature, but that doesn't catch regressions
when I change something. It's the biggest gap in the project. If
I had another week, the first thing I'd add is Jest + Supertest
for the backend (especially the auth flow and the aggregations) and
Vitest + React Testing Library for the frontend.

**Examiner**: Why did you defer tests, given that you know they're
the biggest gap?

**Student**: I prioritised breadth — getting the full stack working
end-to-end so I could see the system from a user-flow perspective
— over depth in any one layer. In hindsight, I'd write at least
smoke tests in parallel; pure manual testing creates compounding
risk as the codebase grows. It's a lesson learned for the next
project.

---

### Part 5 — Stretch (minutes 13–15)

**Examiner**: Suppose this app suddenly has a million users. What
breaks first, and how do you fix it?

**Student**: *(takes a moment to think)*. The first thing to break
will be the backend — single Node process, single MongoDB cluster.
Two attack vectors.

First, the backend. Because auth is stateless JWT, I can scale
horizontally — multiple Node instances behind a load balancer,
zero shared state needed. That's the easy fix.

Second, the database. Reads will eventually saturate the primary.
I'd add read replicas in MongoDB and route analytics queries to the
replicas, since they don't need real-time consistency. For writes,
I'd add a write-buffering layer — push new expenses onto a queue
(BullMQ + Redis) and batch them into MongoDB. That decouples user-
facing latency from DB write throughput.

Third, the analytics pipelines themselves. At a million users, even
the aggregation pipelines become expensive. I'd move analytics into
a separate service that pre-computes daily summaries into a
materialised view (a `daily_user_summaries` collection), and the
API just reads from that.

Beyond infrastructure: a CDN (Vercel already gives me that for the
frontend), Cloudflare in front of the backend for caching and DDoS
protection, structured logging plus Sentry for observability, and
proper rate limiting on the auth endpoints.

**Examiner**: Last question. If you had to integrate this with a
real bank account — pull transactions automatically — how would
you approach it?

**Student**: I'd use Plaid or Tink — both are aggregator APIs that
handle the OAuth dance with the user's bank, and they return
normalised transaction data. The flow looks like: the client SDK
opens a Plaid Link modal, the user picks their bank and logs in
inside Plaid's UI, Plaid returns a `public_token` to my client.
The client sends that to my backend, which exchanges it for an
`access_token` via Plaid's server-to-server API. I store the
access token *encrypted at rest* (key management via the cloud
provider's KMS), and run a periodic job that polls Plaid for new
transactions and writes them into my expenses collection with a
`source: 'plaid'` flag. Category mapping is the interesting bit —
banks return their own categories which I'd map to mine.

Security: never log or expose access tokens. Compliance: depending
on the jurisdiction I might need PSD2 (EU) or similar — Plaid
handles most of that for me, but I'd still consult their docs and
likely my university's data-protection guidance.

**Examiner**: Good. That's all from me. Anything you want to add?

**Student**: Just to flag — the biggest things I'd improve are
tests, TypeScript, and refresh tokens. I learned a lot building
this, especially around MongoDB aggregations and the trade-offs of
stateless auth.

**Examiner**: Thank you.

---

## What the script demonstrates

- **Concrete examples over abstractions.** "Let me show you" beats
  reciting documentation.
- **Acknowledging trade-offs.** "It's a trade-off, here's why I
  chose this" lands far better than defending a choice as
  universally correct.
- **Owning weaknesses.** "No tests" is the biggest weakness; saying
  so out loud disarms the examiner instead of letting them catch you.
- **Time on the harder questions.** Spend more thinking time on
  stretch questions — a 5-second pause is fine.

## Practice tactic

Read this aloud once, exactly as written. Then go back through and
answer each question in your own words. Then re-read the script and
notice where your wording was weaker — those are the rough edges
to smooth out.
