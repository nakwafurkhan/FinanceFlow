import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  TrendingUp,
  Wallet,
  Target,
  Repeat,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from '../utils/cx';
import useMediaQuery from '../hooks/useMediaQuery';
import Logo from './Logo';

const links = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/expenses', label: 'Expenses', icon: Receipt },
  { to: '/app/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/app/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/app/income', label: 'Income', icon: Wallet },
  { to: '/app/savings', label: 'Savings Goals', icon: Target },
  { to: '/app/recurring', label: 'Recurring', icon: Repeat },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleLogout = () => {
    logout();
    // Sign out returns the user to the public landing page, not the
    // bare /login screen — landing is more welcoming for a fresh session.
    navigate('/');
  };

  // On desktop the sidebar is always visible (no animation).
  // On mobile it slides in from the left when `open` is true.
  const animateX = isDesktop ? 0 : open ? 0 : -320;

  return (
    <>
      {/* Mobile backdrop */}
      {open && !isDesktop && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-ink-950/40 backdrop-blur-sm md:hidden"
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: animateX }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className={clsx(
          // Mobile: floating fixed panel. Desktop: in-flow flex column.
          'z-40 flex w-72 flex-col gap-2 p-5',
          'border-r border-white/40 bg-white/70 backdrop-blur-xl',
          'dark:border-white/5 dark:bg-ink-950/80',
          isDesktop ? 'sticky top-0 h-screen' : 'fixed inset-y-0 left-0'
        )}
      >
        {/* Brand */}
        <div className="mb-6 px-1">
          <Logo withName size={36} />
          <div className="mt-1 ml-12 text-[11px] uppercase tracking-wider text-ink-500">
            Money OS
          </div>
        </div>

        {/* Links */}
        <nav className="flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                clsx('nav-item', isActive && 'nav-item-active')
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          {user && (
            <div className="flex items-center gap-3 rounded-2xl border border-ink-200/60 bg-white/60 p-3 backdrop-blur dark:border-ink-800 dark:bg-ink-900/60">
              <div
                className="grid h-9 w-9 place-items-center rounded-full text-sm font-semibold text-white shadow-soft"
                style={{ background: user.avatarColor || '#6366f1' }}
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{user.name}</div>
                <div className="truncate text-xs text-ink-500">{user.email}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="nav-item w-full text-left">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </motion.aside>
    </>
  );
}
