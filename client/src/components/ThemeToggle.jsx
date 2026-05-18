import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      className="relative inline-flex h-10 w-10 items-center justify-center
                 rounded-full border border-ink-200/70 bg-white/60 backdrop-blur
                 text-ink-700 shadow-soft transition-colors hover:bg-white
                 dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-100
                 dark:hover:bg-ink-800"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </motion.button>
  );
}
