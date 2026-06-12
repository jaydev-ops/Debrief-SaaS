import axios from "axios";
import { API_URL } from "./config";

const api = axios.create({
  baseURL: API_URL,
  timeout: 25000, // 25s timeout to survive serverless database (Neon) cold-starts
});

// Auto-attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem("debrief_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401, but NOT during login/register attempts
api.interceptors.response.use(
  res => res,
  err => {
    const isAuthEndpoint = err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/auth/register');
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("debrief_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
