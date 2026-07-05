/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Roboto',
          'system-ui',
          'sans-serif',
        ],
        // Editorial accent face used for italic headline highlights on the
        // landing page. Loaded in index.html.
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          'ui-monospace',
          'Menlo',
          'monospace',
        ],
      },
      colors: {
        // ----------------------------------------------------------
        // Iris — signature accent (vivid violet-blue)
        // Used for: primary CTAs, links, focus rings, brand mark
        // ----------------------------------------------------------
        iris: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Violet — pairs with iris for the brand gradient
        violet: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        // Mint — positive / income / success states
        mint: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Coral — destructive / expense / over-budget
        coral: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        // Amber — warning / approaching budget
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Ink — warm-toned neutrals (replaces stock slate for a softer feel)
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      backgroundImage: {
        // Brand gradients — used on CTAs, logo, hero accents
        'gradient-brand':
          'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        'gradient-brand-soft':
          'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)',
        'gradient-mint':
          'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'gradient-coral':
          'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
        // Mesh — used as the landing page hero backdrop
        'gradient-mesh':
          'radial-gradient(at 20% 20%, rgba(99,102,241,0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(168,85,247,0.20) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(16,185,129,0.15) 0px, transparent 50%)',
        // Subtle dotted texture for empty states
        'dot-pattern':
          'radial-gradient(circle at center, rgba(99,102,241,0.18) 1px, transparent 1px)',
      },
      boxShadow: {
        glass: '0 8px 32px -8px rgba(15, 23, 42, 0.08)',
        soft: '0 2px 12px -2px rgba(15, 23, 42, 0.06)',
        glow: '0 0 24px -4px rgba(99, 102, 241, 0.45)',
        'glow-lg': '0 0 48px -8px rgba(99, 102, 241, 0.55)',
        'glow-violet': '0 0 32px -4px rgba(168, 85, 247, 0.50)',
        'glow-mint': '0 0 24px -4px rgba(16, 185, 129, 0.50)',
        'glow-coral': '0 0 24px -4px rgba(244, 63, 94, 0.50)',
        'inset-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 24px -4px rgba(99, 102, 241, 0.4)' },
          '50%': { boxShadow: '0 0 48px -4px rgba(99, 102, 241, 0.7)' },
        },
        'sparkle': {
          '0%, 100%': { opacity: 0.3, transform: 'scale(0.9)' },
          '50%': { opacity: 1, transform: 'scale(1.1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        sparkle: 'sparkle 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
