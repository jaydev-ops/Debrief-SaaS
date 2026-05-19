import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
  timeout: 10000,
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
