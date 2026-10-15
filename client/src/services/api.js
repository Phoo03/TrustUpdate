/**
 * services/api.js — Axios instance pre-configured for the TrustUpdate API.
 *
 * - Base URL uses the CRA proxy (http://localhost:5000) in development.
 * - Automatically attaches the JWT from localStorage to every request.
 * - Redirects to /login on 401 responses.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60 s — large file uploads may take time
});

// ─── Request Interceptor — attach JWT ──────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor — handle 401 globally ───────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default api;
