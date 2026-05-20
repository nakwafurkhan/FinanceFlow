/**
 * utils/constants.js
 * --------------------------------------------------------------
 * Category lists + the brand-aligned colour palette used by every
 * chart, list-item avatar, and category badge in the app.
 *
 * Each colour is hand-picked from the new iris/violet/mint/coral/amber
 * palette (see tailwind.config.js) so charts and inline avatars stay
 * visually consistent with the rest of the UI.
 */

export const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other',
];

export const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'NetBanking', 'Other'];

// Category palette — every entry pulls from a Tailwind colour scale we
// already define, so dark/light treatments stay consistent.
export const CATEGORY_COLORS = {
  Food: '#F43F5E',          // coral — appetite/dining
  Travel: '#6366F1',        // iris — primary brand
  Shopping: '#F59E0B',      // amber — retail energy
  Bills: '#0EA5E9',         // sky — utilities
  Entertainment: '#EC4899', // pink — leisure
  Health: '#10B981',        // mint — wellbeing
  Education: '#8B5CF6',     // violet — knowledge
  Other: '#94A3B8',         // ink-400 — neutral fallback
};

// Generic chart cycle, used when categories aren't fixed (e.g. a
// monthly bar chart that just needs N distinct colours)
export const CHART_COLORS = [
  '#6366F1', // iris
  '#8B5CF6', // violet
  '#10B981', // mint
  '#F43F5E', // coral
  '#F59E0B', // amber
  '#0EA5E9', // sky
  '#EC4899', // pink
  '#94A3B8', // ink-400
];

// Avatar swatches users can pick in Settings — same palette as above
// minus the neutral, so every avatar feels intentional.
export const AVATAR_COLORS = [
  '#6366F1',
  '#8B5CF6',
  '#10B981',
  '#F43F5E',
  '#F59E0B',
  '#0EA5E9',
  '#EC4899',
];
