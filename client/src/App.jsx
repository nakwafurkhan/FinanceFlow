import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Analytics from './pages/Analytics';
import Income from './pages/Income';
import SavingsGoals from './pages/SavingsGoals';
import RecurringExpenses from './pages/RecurringExpenses';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';

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

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="skeleton h-3 w-40" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <PageWrap><Login /></PageWrap>}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <PageWrap><Register /></PageWrap>}
        />

        {/* Protected — wrapped in AppShell for sidebar + navbar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<PageWrap><Dashboard /></PageWrap>} />
            <Route path="/expenses" element={<PageWrap><Expenses /></PageWrap>} />
            <Route path="/budgets" element={<PageWrap><Budgets /></PageWrap>} />
            <Route path="/analytics" element={<PageWrap><Analytics /></PageWrap>} />
            <Route path="/income" element={<PageWrap><Income /></PageWrap>} />
            <Route path="/savings" element={<PageWrap><SavingsGoals /></PageWrap>} />
            <Route path="/recurring" element={<PageWrap><RecurringExpenses /></PageWrap>} />
            <Route path="/settings" element={<PageWrap><Settings /></PageWrap>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}
