// Tiny classnames helper so we don't pull in a dependency
export const clsx = (...parts) =>
  parts.filter(Boolean).flat().filter(Boolean).join(' ');
