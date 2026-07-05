/**
 * api/axios.js
 * --------------------------------------------
 * A pre-configured Axios instance used by every API call in the app.
 *
 * Why interceptors?
 *   - REQUEST interceptor injects the JWT from localStorage so we never
 *     forget to send it on a protected route.
 *   - RESPONSE interceptor catches 401s and force-logs-out the user.
 *
 * Timeout: 60s. The backend runs on Render's free tier, which sleeps after
 * ~15 min idle and takes 30–60s to cold-start. A short timeout would abort
 * the very first request after a nap and surface as a blank/empty screen,
 * so we give cold starts room to finish.
 */

import axios from 'axios';

// In dev: vite proxies /api to the local backend.
// In production: set VITE_API_URL in .env to your deployed backend.
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// REQUEST — attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('financeflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// RESPONSE — handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('financeflow_token');
      localStorage.removeItem('financeflow_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
