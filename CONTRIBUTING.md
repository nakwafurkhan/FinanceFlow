# Contributing to FinanceFlow

Thanks for your interest! Whether you're filing a bug, suggesting a
feature, or sending a PR, this doc gets you up to speed in a few minutes.

---

## Local setup

```bash
git clone https://github.com/nakwafurkhan/FinanceFlow.git
cd FinanceFlow

# Backend
cd server
cp .env.example .env       # fill in MONGO_URI + JWT_SECRET
npm install
npm run dev                 # → http://localhost:8080

# Frontend (new terminal)
cd ../client
echo "VITE_API_URL=http://localhost:8080/api" > .env
npm install
npm run dev                 # → http://localhost:5173
```

Use Node 20+ (see `.nvmrc`). If you have `nvm` installed:

```bash
nvm use
```

---

## Project layout

```
client/   React + Vite frontend (deployed to Vercel)
server/   Express + MongoDB backend (deployed to Render)
docs/     Viva preparation package
```

See the [README](./README.md#-project-structure) for the full tree.

---

## Code style

- **Indentation**: 2 spaces
- **Quotes**: single quotes in JS/JSX (`'foo'`), double in JSX attributes (`""`)
- **Imports**: external first, then internal (relative paths last)
- **React**: functional components + hooks only (no class components except
  `ErrorBoundary` which has to be a class)
- **Tailwind**: prefer utility classes; for repeated patterns, add a
  `.glass-card`, `.btn-primary`, etc. to `client/src/index.css`
- **Comments**: explain *why*, not *what*. The code shows what.

---

## Brand & design system

Defined in `client/tailwind.config.js`:

| Token | Value | Use for |
|---|---|---|
| `iris-500` | `#6366F1` | Primary brand, CTAs, focus rings |
| `violet-500` | `#8B5CF6` | Secondary, gradient pair with iris |
| `mint-500` | `#10B981` | Income, success, positive |
| `coral-500` | `#F43F5E` | Expenses, destructive, alerts |
| `amber-500` | `#F59E0B` | Warnings, top-category accents |
| `gradient-brand` | iris → violet → purple | Hero, buttons, brand mark |
| `gradient-mesh` | radial blobs | Landing hero background |
| `shadow-glow` | `0 0 24px iris/45` | Primary CTA hover |

Animations live as Tailwind keyframes in the same config:
`fade-up`, `scale-in`, `float`, `gradient-shift`, `pulse-glow`, `sparkle`.

---

## Commit messages

We follow loose [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short summary

Optional longer body explaining the why. Wrap at ~72 chars.
```

Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `style`.

---

## Pull requests

1. Fork & branch from `main`. Name your branch `feat/...`, `fix/...`, etc.
2. Keep PRs focused — one concern per PR. Big PRs land slower.
3. Include a clear description: what changes, why, screenshots for UI.
4. Test locally before pushing.
5. The maintainer will review and either merge or comment with feedback.

---

## What to work on

Roadmap items are tracked in the README. Easy first PRs:

- Add a real screenshot to `client/public/screenshots/`
- Add unit tests for any utility function in `client/src/utils/` or
  `server/utils/`
- Improve accessibility on a specific page (heading hierarchy,
  aria-labels)
- Fix a typo in the docs

For larger features, open an issue first to discuss approach.

---

## License

By contributing, you agree your contributions are licensed under MIT,
same as the project.
