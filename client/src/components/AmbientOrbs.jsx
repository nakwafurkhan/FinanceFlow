/**
 * components/AmbientOrbs.jsx
 * --------------------------------------------------------------
 * Ambient background orbs — blurred brand-gradient blobs that drift slowly.
 * Shared across the landing page, auth pages, and the app shell so the whole
 * product breathes with one consistent atmosphere.
 *
 * Performance (this is mounted on every screen, so it matters):
 *   - Animates transform ONLY (x / y / scale) on a layer-promoted element
 *     (willChange: transform). The expensive blur is rasterised once and then
 *     just translated — it is not recomputed each frame.
 *   - Respects prefers-reduced-motion: renders static orbs, no rAF loop.
 *   - `intense` (landing) shows 3 brighter orbs; the default (in-app) shows a
 *     calmer 2 so it stays ambient and cheap behind dense data screens.
 *   - pointer-events-none + fixed + aria-hidden: purely decorative.
 */

import { motion, useReducedMotion } from 'framer-motion';

const ORBS = [
  { c: '#6366f1', w: 520, h: 520, top: '-160px', right: '-120px', dur: 24, dx: -40, dy: 40 },
  { c: '#a855f7', w: 460, h: 460, bottom: '-180px', left: '-140px', dur: 28, dx: 50, dy: -30 },
  { c: '#10b981', w: 360, h: 360, top: '45%', left: '35%', dur: 32, dx: -50, dy: -40 },
];

export default function AmbientOrbs({ intense = false }) {
  const reduce = useReducedMotion();
  const orbs = intense ? ORBS : ORBS.slice(0, 2);
  const opacity = intense ? 0.5 : 0.26;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: o.w,
            height: o.h,
            top: o.top,
            bottom: o.bottom,
            left: o.left,
            right: o.right,
            opacity,
            filter: 'blur(72px)',
            willChange: 'transform',
            background: `radial-gradient(circle, ${o.c}, transparent 70%)`,
          }}
          animate={
            reduce ? undefined : { x: [0, o.dx, 0], y: [0, o.dy, 0], scale: [1, 1.08, 1] }
          }
          transition={
            reduce
              ? undefined
              : { duration: o.dur, repeat: Infinity, ease: 'easeInOut' }
          }
        />
      ))}
    </div>
  );
}
