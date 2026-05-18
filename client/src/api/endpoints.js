/**
 * api/endpoints.js
 * --------------------------------------------
 * Thin wrapper functions — one per endpoint — so pages stay clean.
 */

import api from './axios';

// AUTH
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

// EXPENSES
export const expenseApi = {
  list: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  remove: (id) => api.delete(`/expenses/${id}`),
};

// BUDGETS
export const budgetApi = {
  list: (params) => api.get('/budgets', { params }),
  upsert: (data) => api.post('/budgets', data),
  remove: (id) => api.delete(`/budgets/${id}`),
};

// ANALYTICS
export const analyticsApi = {
  dashboard: (params) => api.get('/analytics/dashboard', { params }),
  categoryBreakdown: (params) => api.get('/analytics/category-breakdown', { params }),
  dailyTrend: (params) => api.get('/analytics/daily-trend', { params }),
  monthlyTrend: (params) => api.get('/analytics/monthly-trend', { params }),
  insights: (params) => api.get('/analytics/insights', { params }),
};

// INCOME
export const incomeApi = {
  list: (params) => api.get('/income', { params }),
  create: (data) => api.post('/income', data),
  update: (id, data) => api.put(`/income/${id}`, data),
  remove: (id) => api.delete(`/income/${id}`),
};

// SAVINGS
export const savingsApi = {
  list: () => api.get('/savings'),
  create: (data) => api.post('/savings', data),
  update: (id, data) => api.put(`/savings/${id}`, data),
  contribute: (id, amount) => api.post(`/savings/${id}/contribute`, { amount }),
  remove: (id) => api.delete(`/savings/${id}`),
};

// RECURRING
export const recurringApi = {
  list: () => api.get('/recurring'),
  create: (data) => api.post('/recurring', data),
  update: (id, data) => api.put(`/recurring/${id}`, data),
  remove: (id) => api.delete(`/recurring/${id}`),
};

/**
 * EXPORT
 * ------------------------------------------------------------
 * IMPORTANT: We cannot use a plain <a href="/api/export/..."> because
 * those native browser requests skip our Axios interceptor, which means
 * the JWT is never attached → the server returns 401.
 *
 * Instead we fetch the file as a blob (Axios attaches the token), turn it
 * into an object URL, and trigger a programmatic download. Same UX —
 * properly authenticated.
 */
const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const exportApi = {
  csv: async (params = {}) => {
    const res = await api.get('/export/csv', { params, responseType: 'blob' });
    triggerDownload(res.data, `financeflow-expenses-${Date.now()}.csv`);
  },
  pdf: async (params = {}) => {
    const res = await api.get('/export/pdf', { params, responseType: 'blob' });
    triggerDownload(res.data, `financeflow-report-${Date.now()}.pdf`);
  },
};
