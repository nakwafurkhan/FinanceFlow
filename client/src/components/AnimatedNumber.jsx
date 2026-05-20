/**
 * components/AnimatedNumber.jsx
 * --------------------------------------------------------------
 * Counts a numeric value up from 0 to the target with easing, then
 * holds. Reads `prefers-reduced-motion` and jumps straight to the
 * target when the user has motion preferences disabled.
 *
 * Usage:
 *   <AnimatedNumber value={15400} formatter={formatCurrency} />
 *   <AnimatedNumber value={42} duration={0.8} />
 *
 * Performance notes:
 *   - Updates textContent directly inside a Framer Motion `animate`
 *     subscription instead of setState, so each frame avoids a React
 *     re-render. With 4 stat cards animating in parallel, this keeps
 *     paint cost negligible.
 *   - Cleans up the animation on unmount or value change.
 */

import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

export default function AnimatedNumber({
  value,
  formatter = (n) => String(n),
  duration = 1.2,
  className = '',
}) {
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Skip animation entirely if the user prefers reduced motion
    if (shouldReduceMotion || !Number.isFinite(value)) {
      node.textContent = formatter(value);
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        if (node) node.textContent = formatter(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value, duration, shouldReduceMotion, formatter]);

  return (
    <span ref={ref} className={className}>
      {formatter(shouldReduceMotion ? value : 0)}
    </span>
  );
}
