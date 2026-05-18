import { Menu, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onMenuClick, title }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/60 backdrop-blur-xl dark:border-white/5 dark:bg-ink-950/60">
      <div className="flex items-center gap-3 px-4 py-3 md:px-8 md:py-4">
        <button
          onClick={onMenuClick}
          className="grid h-10 w-10 place-items-center rounded-full border border-ink-200/60 bg-white/60 text-ink-700 backdrop-blur md:hidden dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-100"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex-1">
          <h1 className="text-lg font-semibold tracking-tight md:text-xl">
            {title}
          </h1>
        </div>

        <div className="hidden flex-1 max-w-sm md:flex">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              type="search"
              placeholder="Search transactions, budgets, goals…"
              className="input pl-10"
            />
          </div>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
