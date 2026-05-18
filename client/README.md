# FinanceFlow — Client

React + Vite frontend with Apple-inspired design system.

## Quick Start

```bash
cd client
npm install
npm run dev      # http://localhost:5173
```

Make sure the backend is running on port 5000 — Vite will proxy `/api/*`
to it automatically.

## Stack

- React 18 + Vite 5
- Tailwind CSS 3 (with custom `ink` palette + glass + shadows)
- React Router 6
- Axios with JWT interceptors
- Recharts (charts)
- Framer Motion (page + element animations)
- react-hot-toast (notifications)
- lucide-react (icons)
- vite-plugin-pwa (installable PWA)

## Folder Layout

```
src/
├── api/           Axios instance + endpoint wrappers
├── components/    Reusable UI primitives (GlassCard, Modal, charts, …)
├── context/       AuthContext, ThemeContext (Context API)
├── pages/         One file per route
├── utils/         Formatters + constants + clsx helper
├── App.jsx        Route definitions + page transitions
├── main.jsx       App bootstrap
└── index.css      Tailwind layer + Apple design tokens
```
