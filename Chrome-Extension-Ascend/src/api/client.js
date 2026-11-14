import axios from "axios";
import { storage } from "../lib/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 70000, // 70s — accommodates Render free-tier cold-start (~60s)
  headers: {
    "Content-Type": "application/json",
  },
});

// Event listener for auth unauthorized signals
export const AUTH_EXPIRED_EVENT = "ascend_auth_expired";

// Request interceptor: attach Ascend Bearer token from storage
api.interceptors.request.use(async (config) => {
  const token = await storage.get("ascend_token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401s and token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isAuthRequest = error.config?.url?.includes("/auth/");

    if (error.response?.status === 401 && !isAuthRequest) {
      await storage.remove("ascend_token");
      await storage.remove("ascend_user");

      // Notify AuthContext
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
