/**
 * api/axios.js
 * --------------------------------------------
 * A pre-configured Axios instance used by every API call in the app.
 *
 * Why interceptors?
 *   - REQUEST interceptor injects the JWT from localStorage so we never
 *     forget to send it on a protected route.
 *   - RESPONSE interceptor catches 401s and force-logs-out the user.
 */

import axios from 'axios';

// In dev: vite proxies /api to http://localhost:5000.
// In production: set VITE_API_URL in .env to your deployed backend.
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
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
