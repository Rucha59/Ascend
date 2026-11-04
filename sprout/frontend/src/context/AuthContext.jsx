
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { supabase } from "../lib/supabase";

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
      setLoading(false);
      return;
    }

    const cached = localStorage.getItem("sprout_user");

    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        // Ignore invalid cached data
      }
      setLoading(false);
    }

    api.get("/users/me")
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("sprout_user", JSON.stringify(res.data));
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            localStorage.removeItem("sprout_token");
            localStorage.removeItem("sprout_user");
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
  }, []);

  // Exchange a verified Supabase session for a Sprout JWT.
  const exchangeSupabaseSession = async (session) => {
    if (!session?.access_token) {
      throw new Error("No authenticated Supabase session found.");
    }

    const response = await api.post(
        "/auth/register-oauth",
        {},
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
    );

    const { token, user: userData } = response.data;

    if (!token || !userData) {
      throw new Error("Backend did not return a valid Sprout session.");
    }

    localStorage.setItem("sprout_token", token);
    localStorage.setItem("sprout_user", JSON.stringify(userData));

    setUser(userData);

    return userData;
  };

  // Supabase email registration.
  const register = async (payload) => {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      options: {
        data: {
          name: payload.name.trim(),
          username: payload.username.trim(),
        },
      },
    });

    if (error) throw error;

    // With email confirmation enabled, session should normally be null.
    // Handle immediate sessions too, in case confirmation is disabled.
    if (data.session) {
      await exchangeSupabaseSession(data.session);
      return { requiresVerification: false };
    }

    return { requiresVerification: true };
  };

  // Verify signup OTP.
  const verifySignupOtp = async (email, otp) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });

    if (error) throw error;

    await exchangeSupabaseSession(data.session);

    return data.user;
  };

  // Resend signup OTP.
  const resendSignupOtp = async (email) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) throw error;
  };

  // Legacy login — will be migrated to Supabase in Phase 2.
  const login = async (username, password) => {
    const res = await api.post("/auth/login", {
      username,
      password,
    });

    const { token, user: userData } = res.data;

    localStorage.setItem("sprout_token", token);
    localStorage.setItem("sprout_user", JSON.stringify(userData));

    setUser(userData);
    return userData;
  };

  const googleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/supabase-callback`,
      },
    });

    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();

    localStorage.removeItem("sprout_token");
    localStorage.removeItem("sprout_user");

    setUser(null);
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            setUser,
            loading,
            login,
            register,
            verifySignupOtp,
            resendSignupOtp,
            exchangeSupabaseSession,
            googleLogin,
            logout,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}
