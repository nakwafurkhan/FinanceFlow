# Changelog

All notable changes to FinanceFlow will be listed here. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Coming soon
- AI-powered insights via OpenAI integration
- Real automated tests (Jest + Supertest, Vitest + RTL)
- Migration to TypeScript
- Multi-currency support with daily FX rates

---

## [1.1.0] — 2026-05-20

A major polish pass. The product now feels like a portfolio piece.

### Added
- **Public landing page** at `/` — hero with animated gradient mesh,
  features grid, "Made by" author section, AI Coming Soon teaser
- **Custom logo** (SVG) — abstract flowing-F mark with iris→violet→purple
  gradient
- **Confirmation modal system** (`ConfirmModal` + `useConfirm` hook) —
  replaces every `window.confirm()` call with a branded, async-aware,
  destructive-variant-supporting dialog
- **Animated number tickers** on Dashboard stat cards — count from 0
  to target with easing, respect `prefers-reduced-motion`
- **Error boundary** at the route level — one page crash no longer
  takes down the whole app
- **Viva preparation package** in `docs/` — walkthrough, Q&A bank,
  cheat sheet, mock script, ChatGPT prompt
- **Author credit** section + GitHub avatar on landing page; small
  author link on Login + Register
- **Vercel cache-control headers** — immutable for `/assets/*`, no-cache
  for HTML
- **Security headers** — `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
  `Permissions-Policy`
- `CONTRIBUTING.md`, `CHANGELOG.md`, `.nvmrc` (Node 20)
- `useInView` hook for cheap IntersectionObserver-based visibility
  checks

### Changed
- **Routing**: dashboard moved from `/` to `/app/dashboard`. Landing
  page now owns the root. All app routes prefixed with `/app/`.
- **Code splitting**: every protected page is now `React.lazy` + Suspense.
  Anonymous landing-page visitors no longer download Dashboard, Expenses,
  Recharts, etc. — initial bundle drops ~70%.
- **Color palette refresh**: iris (#6366F1), violet (#8B5CF6), mint
  (#10B981), coral (#F43F5E), amber (#F59E0B), warm ink neutrals.
  Replaces the previous indigo / red / sky mix.
- **PDF export redesign** (`server/controllers/exportController.js`)
  — minimalist branded layout with summary cards, category-coloured
  rows, total banner, and footer attribution. Matches the website
  aesthetic.
- **Toaster styling** — glass background, iris-tinted border, mint icon
  on success, coral on error
- **CORS handler** in `server/server.js` is now robust to env-var
  formatting issues (trailing slashes, case, comma-separated list)
- **README** restructured around "How to use it" — live demo + local
  setup paths, About-the-author section
- Sidebar logo replaced with the new SVG mark; sign-out returns to
  the landing page

### Fixed
- **Security**: removed `server/.env` from the repo (was committed with
  placeholder JWT secret and weak Atlas credentials)
- **CORS bug**: previous handler combined `origin: '*'` with
  `credentials: true`, which browsers reject — now uses an allow-list
  with a function-form origin check
- **SPA routing on Vercel**: added `vercel.json` rewrite rule so deep
  links like `/login` and `/app/dashboard` resolve correctly

### Removed
- Unused legacy `indigo-*` and `red-*` references from `index.css` and
  page styles

---

## [1.0.0] — 2026-05-18

Initial release. MERN-stack personal finance tracker built end-to-end
as a final-year project.

### Features
- JWT auth with bcrypt-hashed passwords (10 salt rounds)
- Expense CRUD with filters, search, server-side pagination
- Monthly budgets per category with safe/warning/exceeded states
- Analytics dashboard powered by MongoDB aggregation pipelines
- Three chart types (pie, bar, area) via Recharts
- Income, savings goals, recurring expenses tracking
- CSV + PDF export
- Dark mode + PWA install
- Apple-inspired UI with Framer Motion transitions

[Unreleased]: https://github.com/nakwafurkhan/FinanceFlow/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/nakwafurkhan/FinanceFlow/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/nakwafurkhan/FinanceFlow/releases/tag/v1.0.0
