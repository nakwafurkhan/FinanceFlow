/**
 * utils/formatters.js
 * --------------------------------------------
 * Tiny helpers for currency, date, and percentage display.
 */

export const formatCurrency = (n, currency = 'INR') => {
  if (n === null || n === undefined || isNaN(n)) return '—';
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  }
};

export const formatCompact = (n) => {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
};

export const formatDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatShortDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export const monthName = (m) => {
  return new Date(2000, m - 1, 1).toLocaleString('en-US', { month: 'long' });
};
