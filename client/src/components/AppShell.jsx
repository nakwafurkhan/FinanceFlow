import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const pageTitles = {
  '/': 'Dashboard',
  '/expenses': 'Expenses',
  '/budgets': 'Budgets',
  '/analytics': 'Analytics',
  '/income': 'Income',
  '/savings': 'Savings Goals',
  '/recurring': 'Recurring Expenses',
  '/settings': 'Settings',
};

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || 'FinanceFlow';

  return (
    <div className="flex min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {/* min-w-0 + flex-1 stop the content from overflowing next to the sidebar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setOpen(true)} title={title} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
