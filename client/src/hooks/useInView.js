/**
 * hooks/useInView.js
 * --------------------------------------------------------------
 * A tiny IntersectionObserver hook for scroll-triggered behaviour.
 *
 * Why not just Framer Motion's whileInView?
 *   - Framer Motion is great for `motion.*` components but adds runtime
 *     overhead for every observed element.
 *   - This hook is plain DOM IntersectionObserver — perfect for cheap
 *     "has this been visible yet?" checks, lazy-loaded media, or
 *     triggering count-up animations.
 *
 * Usage:
 *   const [ref, inView] = useInView({ threshold: 0.1, once: true });
 *   return <div ref={ref}>{inView && <ExpensiveThing />}</div>;
 */

import { useEffect, useRef, useState } from 'react';

export default function useInView({
  threshold = 0.15,
  rootMargin = '0px',
  once = true,
} = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      // SSR / very old browsers — fall through to visible so content still shows
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}
