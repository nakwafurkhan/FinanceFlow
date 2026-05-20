/**
 * components/Logo.jsx
 * --------------------------------------------------------------
 * The FinanceFlow brand mark.
 *
 *   - <Logo />            → mark only (square, scalable)
 *   - <Logo withName />   → mark + wordmark
 *
 * Design: an abstract "flowing F" — two stacked waves that
 * suggest both the letter F and the movement of money. Filled
 * with the brand iris→violet gradient.
 *
 * Perf note (Phase A): the gradient id is generated via React's
 * useId() hook so every instance has a stable, deterministic id
 * across re-renders. The previous Math.random() approach generated
 * a new id on every render, which caused the SVG `fill="url(#id)"`
 * reference to invalidate and re-paint unnecessarily.
 */

import { useId } from 'react';

export default function Logo({
  className = '',
  size = 36,
  withName = false,
  monochrome = false,
}) {
  const reactId = useId();
  // useId returns ":r1:"-style strings; strip the colons to keep the
  // resulting id valid in SVG/CSS contexts.
  const gradientId = `ff-grad-${reactId.replace(/:/g, '')}`;

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="FinanceFlow"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={monochrome ? 'currentColor' : '#6366f1'} />
            <stop offset="50%" stopColor={monochrome ? 'currentColor' : '#8b5cf6'} />
            <stop offset="100%" stopColor={monochrome ? 'currentColor' : '#a855f7'} />
          </linearGradient>
        </defs>

        {/* Rounded square background */}
        <rect x="0" y="0" width="40" height="40" rx="10" fill={`url(#${gradientId})`} />

        {/* Flowing "F" wave mark — two strokes overlapping */}
        <path
          d="M11 12 C 16 12, 22 12, 29 12"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        />
        <path
          d="M11 20 C 15 20, 19 20, 23 20"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
        <path d="M11 12 L 11 28" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.95" />

        {/* Small upward accent — the "flow" rising */}
        <circle cx="29" cy="28" r="2.5" fill="white" opacity="0.9" />
      </svg>

      {withName && (
        <span className="text-xl font-bold tracking-tight bg-gradient-brand bg-clip-text text-transparent dark:from-iris-300 dark:to-violet-300">
          FinanceFlow
        </span>
      )}
    </span>
  );
}
