import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("sprout_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sprout_token");
    if (!token) {
      // No token — go straight to login, don't hang
      setLoading(false);
      return;
    }

    // If we already have a cached user, show the app immediately
    // and refresh in the background. This prevents the infinite
    // "loading" spinner on Render cold starts.
    const cached = localStorage.getItem("sprout_user");
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch { /* ignore bad JSON */ }
      setLoading(false); // ← unblock the UI immediately
    }

    // Silently refresh user data in the background
    api
        .get("/users/me")
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("sprout_user", JSON.stringify(res.data));
        })
        .catch((err) => {
          // Only clear auth on a definitive 401 — not on network errors (cold start timeout)
          if (err.response?.status === 401) {
            localStorage.removeItem("sprout_token");
            localStorage.removeItem("sprout_user");
            setUser(null);
          }
          // On timeout / network error: keep the cached user, they'll hit
          // a real 401 on the next authenticated request if the token is bad
        })
        .finally(() => {
          // If there was no cached user, loading is still true — resolve it now
          setLoading(false);
        });
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });    const { token, user: userData } = res.data;
    localStorage.setItem("sprout_token", token);
    localStorage.setItem("sprout_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (payload) => {
    const res = await api.post("/auth/register", payload);
    const { token, user: userData } = res.data;
    localStorage.setItem("sprout_token", token);
    localStorage.setItem("sprout_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("sprout_token");
    localStorage.removeItem("sprout_user");
    setUser(null);
  };

  return (
      <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
