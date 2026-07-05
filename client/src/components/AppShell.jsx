import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AmbientOrbs from './AmbientOrbs';

// Map a route path → its page title. Keys match /app/* paths so the
// title in the topbar stays accurate after the Phase 3 router move.
const pageTitles = {
  '/app/dashboard': 'Dashboard',
  '/app/expenses': 'Expenses',
  '/app/budgets': 'Budgets',
  '/app/analytics': 'Analytics',
  '/app/income': 'Income',
  '/app/savings': 'Savings Goals',
  '/app/recurring': 'Recurring Expenses',
  '/app/settings': 'Settings',
};

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const title = pageTitles[pathname] || 'FinanceFlow';

  return (
    <div className="relative flex min-h-screen">
      {/* Same ambient backdrop as the landing page — ties the whole app
          together. Fixed + behind everything (z-0); content sits at z-10. */}
      <AmbientOrbs />

      <div className="relative z-10 flex min-h-screen w-full">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        {/* min-w-0 + flex-1 stop the content from overflowing next to the sidebar */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar onMenuClick={() => setOpen(true)} title={title} />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            {/* Unified page-entrance transition across every route. Keyed by
                pathname so it re-plays on navigation. Short + transform/opacity
                only = cheap; disabled under reduced-motion. */}
            <motion.div
              key={pathname}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
