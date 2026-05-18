# FinanceFlow — Viva Q&A Bank

> 75+ examiner-style questions, categorised. Each answer is **viva-length**
> — 2 to 4 sentences. Memorise the *structure* of an answer, not the
> exact words.

---

## A. Project Overview & Motivation

**1. In one sentence, what is FinanceFlow?**
> A full-stack personal finance and budgeting tracker built on the MERN
> stack, with JWT authentication, MongoDB aggregation pipelines for
> analytics, and a Vite-built React PWA frontend.

**2. Why did you build this?**
> Personal finance is a problem most students actually have, and it
> exercises the full breadth of the MERN stack — auth, CRUD, complex
> queries, charts, and exports. It gave me a single project I could
> point to on a resume that covers everything.

**3. Who is the target user?**
> Individuals tracking their own spending — students, early-career
> professionals — who want something more visual than a spreadsheet but
> simpler than an enterprise tool like Mint or YNAB.

**4. What's your favourite part of the project, and why?**
> The analytics layer. Building the aggregation pipelines forced me to
> understand how MongoDB queries actually work under the hood, and the
> result is fast even with thousands of expenses.

**5. How long did it take you to build?**
> [Honest answer. Examiners can tell if you exaggerate. "About X
> weeks, working evenings and weekends" is fine.]

---

## B. Architecture & Stack

**6. What is the MERN stack?**
> MongoDB (document database), Express (Node web framework), React
> (UI library), Node.js (JavaScript runtime). They all use JavaScript,
> which keeps the mental model simple end-to-end.

**7. Why MERN over LAMP or MEAN?**
> JavaScript everywhere is the main draw — same language for client,
> server, and data layer (JSON). React is also more flexible than
> Angular for this size of app, and MongoDB fits document-shaped data
> better than MySQL would here.

**8. Walk me through the request lifecycle when a user adds an expense.**
> The React form submits, calls our Axios helper which attaches the
> JWT in the Authorization header. The request hits Express, passes
> the CORS check, gets routed to the expense router, runs through the
> `protect` middleware (which verifies the token and loads the user),
> then the controller validates input and writes to MongoDB. The
> response goes back as JSON, and React updates its state.

**9. What's the difference between the client and the server?**
> The client is the React app that runs in the browser and handles UI.
> The server is the Node/Express process that runs the REST API and
> talks to the database. They communicate over HTTP, with the client
> never touching MongoDB directly.

**10. Why did you split client and server into separate folders?**
> Separation of concerns. The frontend can be deployed independently
> (on Vercel), and the backend has its own dependencies and lifecycle
> (deployed on Render). Each can be developed and scaled separately.

**11. Could you have built this without a backend?**
> For a personal-only app, yes — using something like Firebase or
> Supabase. But I wanted to learn the full stack, and a custom
> Express API gives me total control over the analytics endpoints
> and data shape.

---

## C. MongoDB & Mongoose

**12. Why MongoDB instead of PostgreSQL?**
> The data is per-user and document-shaped. Most queries are "give me
> this user's expenses filtered by X". A document store fits naturally
> and aggregation pipelines handle analytics. A relational schema
> would work but adds JOIN complexity for not much benefit at this
> scale.

**13. What is Mongoose?**
> An Object Document Mapper for MongoDB. It lets you define schemas
> with validation, hooks, and methods, then translates JavaScript
> objects into MongoDB documents.

**14. What is a schema vs a model vs a document?**
> A schema is the definition of what a document looks like (fields,
> types, validation). A model is a constructor produced from the
> schema. A document is one record — an instance of the model.

**15. How many collections does FinanceFlow have?**
> Six: users, expenses, budgets, income, savingsGoals, and
> recurringExpenses.

**16. Why are users and expenses separate collections instead of an
embedded array?**
> Because expenses are unbounded — a user can have thousands. MongoDB
> document size is capped at 16 MB, and embedding would make updates
> expensive (whole document rewrite on every new expense). Referencing
> by `userId` is the right pattern for unbounded child data.

**17. How do you link an expense to a user?**
> The Expense schema has a `userId` field with `ref: 'User'`. The
> value is the user's ObjectId. We can `populate('userId')` when we
> need the user's details alongside the expense.

**18. What is an ObjectId?**
> MongoDB's default primary-key type. It's a 12-byte identifier
> encoding a timestamp, machine identifier, process id, and counter —
> globally unique without needing a central coordinator.

**19. What indexes do you have, and why?**
> A unique index on `users.email` (fast login lookup + dedup), a
> compound index on `expenses` for `(userId, date)` (fast filtering),
> and a compound unique index on `budgets` for `(userId, category,
> month, year)` so the same user can't have two budgets for the same
> category in the same month.

**20. Why is `password` set to `select: false`?**
> So that queries don't return the hash by default. Even leaking a
> hash is bad — attackers can run offline brute force. We only fetch
> it explicitly inside the login controller.

**21. What does the pre-save hook on the User schema do?**
> It hashes the password with bcrypt before saving, but only if the
> password field was modified. This means updates to other fields
> (like `name`) don't accidentally re-hash an already-hashed password.

**22. What's the difference between `find()` and `findOne()`?**
> `find()` returns a cursor (lazy iterator) over all matching
> documents. `findOne()` returns a single matching document, or null
> if none. Use `findOne()` when you know there's at most one match —
> faster and cleaner.

**23. Why use `lean()` queries?**
> `.lean()` returns plain JavaScript objects instead of full Mongoose
> documents. Faster and uses less memory, but you lose virtuals and
> instance methods. We use it for read-only listings.

**24. How does MongoDB handle relationships without JOINs?**
> Two patterns: embedding (small, bounded child data goes inside the
> parent document) and referencing (store an ObjectId pointing to
> another collection, resolve at query time with `$lookup` or
> `populate`). We use referencing for users/expenses, embedding for
> savings-goal contributions.

---

## D. Express & REST API

**25. What is Express?**
> A minimalist Node.js web framework. It provides routing, middleware
> support, and request/response helpers, but stays unopinionated about
> almost everything else.

**26. What is middleware?**
> A function that sits between the incoming request and the route
> handler. It receives `(req, res, next)` and either passes control
> along with `next()`, modifies the request, or short-circuits the
> response.

**27. List the middleware in your `server.js`.**
> CORS, JSON body parser, URL-encoded body parser, Morgan logger
> (dev only), the route handlers themselves, a 404 catch-all, and a
> central error handler.

**28. What is REST?**
> Representational State Transfer — an architectural style that uses
> HTTP verbs (GET, POST, PUT, DELETE) on resource URLs, with
> statelessness, cacheability, and uniform interface as core
> constraints.

**29. Why are your routes plural (e.g., `/api/expenses`)?**
> REST convention — resource collections are pluralised. `/expenses`
> is the collection; `/expenses/:id` is one element of it.

**30. How does your error handler work?**
> Any route that throws (or rejects) ends up at the
> `errorHandler` middleware mounted last. It logs the error and
> returns a JSON response with a status code (defaults to 500) and a
> message. In production we suppress the stack trace.

**31. What does `express.json()` do?**
> Parses incoming requests with `Content-Type: application/json` and
> populates `req.body` with the parsed JavaScript object.

**32. What is `express-async-handler`?**
> A wrapper that catches rejected promises in async route handlers
> and forwards them to Express's error middleware. Without it, an
> unhandled rejection in an async handler would silently hang the
> request.

**33. Why is the error handler mounted LAST?**
> Because Express middleware runs in registration order. If it were
> first, every request would pass through it before reaching real
> handlers; mounted last, it only catches errors that bubble up.

**34. How do you handle 404s?**
> A `notFound` middleware mounted after all routes — it constructs an
> error with status 404 and forwards to the error handler. So 404 is
> just a special case of error handling.

---

## E. Authentication & Security

**35. Walk me through your authentication flow.**
> User submits credentials. The backend looks up the user by email,
> compares the supplied password against the bcrypt hash. If valid,
> sign a JWT with the user's id and `JWT_SECRET`, return it. The
> frontend stores the token in `localStorage` and attaches it to
> every subsequent request as `Authorization: Bearer <token>`. A
> `protect` middleware verifies the token on protected routes.

**36. What is JWT?**
> JSON Web Token. A signed, base64-encoded string with three parts:
> header (algorithm), payload (claims like user id), signature. The
> signature is an HMAC of the header + payload using a server-side
> secret, so anyone can READ the claims but only the server can
> FORGE a valid token.

**37. Why bcrypt for password hashing?**
> It's adaptive — the cost factor (we use 10 salt rounds) can be
> tuned upward as hardware gets faster, slowing brute force. It also
> automatically generates and stores per-password salts, so the same
> password produces different hashes for different users.

**38. Why not SHA-256 for passwords?**
> SHA-256 is too fast — attackers can compute billions per second on
> a GPU. bcrypt is deliberately slow, with a tunable cost. Modern
> password hashing wants slowness, not speed.

**39. Where do you store the JWT on the client?**
> `localStorage`. This is a deliberate trade-off: localStorage is
> vulnerable to XSS, cookies with HttpOnly are vulnerable to CSRF
> unless you add CSRF tokens. For an SPA on a single trusted domain,
> localStorage is a reasonable default; for higher-stakes apps I'd
> switch to HttpOnly cookies + SameSite + CSRF protection.

**40. What's the difference between authentication and authorization?**
> Authentication: "who are you?" — proving identity (login, token
> verify). Authorization: "what are you allowed to do?" — proving
> permission. In FinanceFlow, the JWT verify proves authentication;
> the `userId === req.user._id` check inside each controller proves
> authorization.

**41. What happens if a JWT is stolen?**
> The thief can impersonate the user until the token expires. That's
> why production JWTs should be short-lived (~15 min) and paired with
> refresh tokens in HttpOnly cookies. For this project I used a
> 30-day token to keep things simple; in production I'd shorten it.

**42. How would you handle logout?**
> Client side: delete the JWT from localStorage. Server side: nothing
> — stateless tokens can't be revoked. For real revocation you'd need
> a token blocklist in Redis, or switch to opaque refresh tokens.

**43. How do you protect against common attacks?**
> bcrypt hashing prevents password theft from a DB dump. CORS
> allow-list prevents cross-origin abuse. Mongoose schemas validate
> input shape. Server-side userId scoping prevents one user reading
> another's data. For production I'd add `helmet` for security
> headers, `express-rate-limit` on auth routes, and input
> sanitisation.

**44. What's CSRF and is your app vulnerable?**
> CSRF tricks a logged-in browser into making unintended requests.
> Since the JWT lives in localStorage (not cookies), and we attach it
> manually via JS, the browser doesn't auto-attach it to forged
> requests — so we're not vulnerable to classic CSRF. But we are
> vulnerable to XSS exfiltrating the token.

---

## F. React & Frontend

**45. Why React?**
> Component model fits the way I think about UI, the ecosystem is
> enormous, and the Recharts/Framer Motion/Tailwind combination
> gives me everything I needed for a polished dashboard without
> reinventing primitives.

**46. What's a functional component?**
> A JavaScript function that returns JSX. It can use hooks for state
> and side effects. Replaced class components for most React work
> since hooks landed in 2019.

**47. What is JSX?**
> Syntactic sugar over `React.createElement()` calls. `<div
> className="foo">bar</div>` compiles down to `React.createElement
> ('div', { className: 'foo' }, 'bar')`.

**48. What is the virtual DOM?**
> An in-memory tree of plain JavaScript objects representing what the
> UI should look like. React diffs the new VDOM against the previous
> one to compute the minimal set of real-DOM mutations.

**49. What is reconciliation?**
> The process by which React compares the new VDOM with the previous
> one and decides what real-DOM updates to apply. The `key` prop
> helps React identify list items between renders.

**50. Why do list items need a `key`?**
> Keys let React track which items are which between renders, so it
> can preserve state and avoid unnecessary work. Without keys,
> reordering or inserting in the middle of a list causes incorrect
> behaviour.

**51. Walk me through `useState`.**
> It's a hook that returns a pair — the current state value and a
> setter function. Calling the setter triggers a re-render with the
> new value. State is preserved across re-renders by React.

**52. When does `useEffect` fire?**
> By default, after every render. With a dependency array, it fires
> only when one of the dependencies changes. With an empty array, it
> fires exactly once after the first render.

**53. What's the difference between `useEffect` and `useLayoutEffect`?**
> `useEffect` fires after the browser paints. `useLayoutEffect` fires
> synchronously after DOM mutations but before paint — useful for
> measuring DOM elements before the user sees them.

**54. Why not class components?**
> Hooks are easier to compose, easier to test, and avoid the
> `this`-binding gotchas of classes. We use functional components
> everywhere.

**55. How does routing work in your app?**
> React Router v6. Public routes (`/login`, `/register`) redirect to
> `/` if logged in. Everything else is wrapped in `<ProtectedRoute>`
> which checks the auth context and either renders the child or
> navigates to `/login`. Protected routes also live inside
> `<AppShell>` which provides the sidebar.

**56. What is a "protected route"?**
> A route that requires authentication to access. Implemented as a
> wrapper component that checks auth state — if logged in, renders
> `<Outlet />`, otherwise redirects to login.

---

## G. State Management & Data Flow

**57. What state management do you use?**
> React Context for cross-cutting state (auth user, theme). Local
> `useState`/`useReducer` for everything else.

**58. Why not Redux?**
> Auth and theme are the only truly global state. Context handles them
> cleanly. Redux's boilerplate (actions, reducers, selectors,
> middleware) would be over-engineering at this app size.

**59. Why not React Query / TanStack Query?**
> It would have been a fine choice and probably faster to add caching
> + refetch logic. For this project I rolled my own per-page state
> with `useEffect` and `useState`, which is simpler to explain in
> a viva and gives me more control. In production I'd reach for
> React Query.

**60. How does AuthContext work?**
> It wraps the app in a Provider that holds `user`, `loading`, and
> `setUser`. On mount, it reads the JWT from localStorage and calls
> `/api/auth/me` to hydrate the user. Components consume it via
> `useAuth()`.

**61. How do you persist theme across reloads?**
> ThemeContext reads `localStorage.theme` on mount (falling back to
> `prefers-color-scheme`). Whenever the user toggles, we update both
> state and localStorage, and toggle the `dark` class on `<body>`.

---

## H. Analytics & Aggregations

**62. Walk me through one aggregation pipeline.**
> Take `categoryBreakdownPipeline`: `$match` filters expenses by
> `userId` and date range, `$group` sums amounts grouped by category,
> `$sort` orders by total descending, `$project` reshapes the output.
> MongoDB runs all four stages server-side and returns chart-ready
> JSON.

**63. Why aggregate server-side instead of in JavaScript?**
> Speed — MongoDB's aggregation engine is C++ and runs over indexed
> data. Bandwidth — we ship one tiny aggregated array instead of
> thousands of raw documents. Atomicity — the pipeline sees a
> consistent snapshot.

**64. What's `$lookup`?**
> The MongoDB equivalent of a SQL LEFT JOIN. Not used in our pipelines
> because expenses already contain the category as a string (no need
> to join).

**65. Why store category as a string instead of as a reference to a
Category collection?**
> Because categories are a small, fixed set ('Food', 'Rent',
> 'Transport', etc.), and embedding the string avoids a JOIN on every
> query. If categories needed to be user-customisable with rich
> metadata, I'd promote them to their own collection.

**66. How are the chart colours decided?**
> A constant map from category to hex colour, defined in
> `client/src/utils/constants.js`. This keeps category colours
> consistent across the pie, bar, and area charts.

---

## I. Build Tooling & PWA

**67. What is Vite?**
> A modern frontend build tool. In development it serves source files
> as native ES modules with extremely fast HMR. In production it
> bundles with Rollup.

**68. Why Vite over Create React App?**
> Speed (200ms cold start vs 10s with CRA), better HMR, and CRA is
> being deprecated.

**69. What is a PWA?**
> A Progressive Web App — a website with a manifest and service
> worker that can be installed on a device's home screen and works
> (partially) offline.

**70. How is your PWA set up?**
> `vite-plugin-pwa` reads my manifest config and generates a service
> worker at build time. After `npm run build && npm run preview`,
> the app is installable on iOS, Android, macOS, and Windows.

**71. What does the service worker actually cache?**
> By default, the plugin caches the built JS/CSS/HTML and a runtime
> cache of API responses based on configurable strategies. We use
> NetworkFirst for API calls so users see fresh data when online but
> still get cached responses if offline.

---

## J. Deployment

**72. How is the app deployed?**
> Backend on Render (Node web service), frontend on Vercel (static
> Vite build), database on MongoDB Atlas (free tier). Environment
> variables are configured separately in each platform's dashboard.

**73. Why Render and not Vercel for the backend?**
> Vercel's serverless functions have cold starts and would require
> refactoring the Express app into individual function handlers.
> Render runs a long-lived Node process, which is closer to a
> traditional server and matches my code's shape.

**74. Why Vercel for the frontend?**
> Free tier, zero-config Vite support, instant deploys on every git
> push, and automatic HTTPS + CDN.

**75. What environment variables does production need?**
> Server: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `NODE_ENV`.
> Client: `VITE_API_URL`.

---

## K. Trade-offs & "What would you do differently?"

**76. What would you improve next?**
> Top of the list: tests. Then TypeScript, refresh tokens, rate
> limiting on auth, and React Query for client-side caching.

**77. What's the biggest weakness of the project?**
> No automated tests. Everything has been verified manually, which
> doesn't scale and doesn't catch regressions.

**78. What was the hardest bug you encountered?**
> [Have a real story. Example: "An off-by-one in date ranges where
> the last day of the month wasn't included in monthly aggregates —
> I fixed it by using `$lt` next-month-start instead of `$lte`
> end-of-month."]

**79. If you were rebuilding from scratch, what would you do differently?**
> TypeScript from day one, tests alongside features instead of
> postponed, and React Query for data fetching. I'd also reach for
> shadcn/ui or Radix primitives instead of building all components
> from scratch.

---

## L. Stretch / System Design

**80. How would you scale this to a million users?**
> Backend horizontally — run multiple Node instances behind a load
> balancer (the JWT-based stateless auth makes this trivial). Add
> Redis for caching hot endpoints. Add read replicas in MongoDB.
> Move analytics to a separate read-only service hitting a replica.
> Add a CDN for static assets (Vercel already does this).

**81. How would you implement bank-account sync?**
> Integrate with Plaid or Tink. Plaid hands us a `public_token` from
> the client SDK, the backend exchanges it for an access token,
> stores it encrypted, and periodically pulls transactions into the
> expenses collection.

**82. How would you add multi-currency support properly?**
> Add a `currency` field to every transaction (not just per-user). On
> read, convert to the user's display currency using a daily
> exchange-rate cache. Store amounts in the smallest unit (cents,
> paise) to avoid floating-point bugs.

**83. How would you handle a 5x traffic spike?**
> Render auto-scales paid plans; free tier doesn't. I'd upgrade and
> set sensible CPU/memory autoscaling rules, and add Cloudflare in
> front for caching + DDoS protection.

**84. How would you migrate from MongoDB to PostgreSQL?**
> Build the Postgres schemas, run a dual-write phase (writes go to
> both), backfill historical data, switch reads to Postgres behind a
> flag, monitor for divergence, then stop writing to Mongo. Never
> a single big-bang cutover.

**85. What if MongoDB goes down?**
> Right now: the app is down. To handle it: read replicas in another
> region, a status page so users know what's happening, and a
> circuit breaker in the API layer that returns cached "stale data"
> instead of erroring.

---

Practice **answering out loud**. A perfect mental answer that comes
out as mumbled fragments doesn't land in a viva. Speak each answer
twice before you walk in.
