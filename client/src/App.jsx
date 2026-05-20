/**
 * App.jsx
 * --------------------------------------------------------------
 * Top-level router.
 *
 * Route map:
 *   /              → Landing (public)
 *   /login         → Login (public, redirects to /app/dashboard if signed in)
 *   /register      → Register (public, redirects to /app/dashboard if signed in)
 *   /app/dashboard → Dashboard (protected, default for signed-in users)
 *   /app/expenses
 *   /app/budgets
 *   /app/analytics
 *   /app/income
 *   /app/savings
 *   /app/recurring
 *   /app/settings  (all protected)
 *
 * Code splitting: every page is `React.lazy`-loaded, so the user only
 * downloads the JS for the route they actually visit. Major bundle-size
 * win on the landing page (the most-visited URL by far).
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import ErrorBoundary from './components/ErrorBoundary';

// Public — eagerly loaded because Landing is the first-paint experience
import Landing from './pages/Landing';

// Auth — small bundles, also OK to load eagerly
import Login from './pages/Login';
import Register from './pages/Register';

// App — lazy-loaded behind auth so they don't ship to anonymous visitors
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Budgets = lazy(() => import('./pages/Budgets'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Income = lazy(() => import('./pages/Income'));
const SavingsGoals = lazy(() => import('./pages/SavingsGoals'));
const RecurringExpenses = lazy(() => import('./pages/RecurringExpenses'));
const Settings = lazy(() => import('./pages/Settings'));

const PageWrap = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// Lightweight skeleton shown while a lazy-loaded page chunk fetches
const RouteFallback = () => (
  <div className="flex h-[60vh] items-center justify-center">
    <div className="w-10 h-10 rounded-full border-2 border-iris-200 border-t-iris-500 animate-spin" />
  </div>
);

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-ink-950">
        <div className="w-10 h-10 rounded-full border-2 border-iris-200 border-t-iris-500 animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname.split('/')[1] || 'root'}>
        {/* ============================================================
            PUBLIC
           ============================================================ */}
        <Route path="/" element={<Landing />} />

        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/app/dashboard" replace />
            ) : (
              <PageWrap>
                <Login />
              </PageWrap>
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/app/dashboard" replace />
            ) : (
              <PageWrap>
                <Register />
              </PageWrap>
            )
          }
        />

        {/* ============================================================
            PROTECTED — wrapped in ProtectedRoute and AppShell
           ============================================================ */}
        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            {/* /app → /app/dashboard */}
            <Route index element={<Navigate to="/app/dashboard" replace />} />

            <Route
              path="dashboard"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrap>
                    <Dashboard />
                  </PageWrap>
                </Suspense>
              }
            />
            <Route
              path="expenses"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrap>
                    <Expenses />
                  </PageWrap>
                </Suspense>
              }
            />
            <Route
              path="budgets"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrap>
                    <Budgets />
                  </PageWrap>
                </Suspense>
              }
            />
            <Route
              path="analytics"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrap>
                    <Analytics />
                  </PageWrap>
                </Suspense>
              }
            />
            <Route
              path="income"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrap>
                    <Income />
                  </PageWrap>
                </Suspense>
              }
            />
            <Route
              path="savings"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrap>
                    <SavingsGoals />
                  </PageWrap>
                </Suspense>
              }
            />
            <Route
              path="recurring"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrap>
                    <RecurringExpenses />
                  </PageWrap>
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PageWrap>
                    <Settings />
                  </PageWrap>
                </Suspense>
              }
            />
          </Route>
        </Route>

        {/* ============================================================
            FALLBACK — anything else goes home
           ============================================================ */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}
