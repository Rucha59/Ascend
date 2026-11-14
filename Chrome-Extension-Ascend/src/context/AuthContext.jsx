import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { storage } from "../lib/storage";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { exchangeOAuthToken, getMe } from "../api/auth";
import { AUTH_EXPIRED_EVENT } from "../api/client";

const AuthContext = createContext(null);
const TOKEN_KEY = "ascend_token";
const USER_KEY = "ascend_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const isAuthenticatingRef = useRef(false);

  // Initialize auth state from storage on startup
  useEffect(() => {
    async function initAuth() {
      try {
        const storedToken = await storage.get(TOKEN_KEY);
        const storedUser = await storage.get(USER_KEY);

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(storedUser);
          }

          // Verify token against /api/users/me
          try {
            const freshUser = await getMe();
            setUser(freshUser);
            await storage.set(USER_KEY, freshUser);
          } catch (err) {
            if (err.response?.status === 401) {
              await storage.remove(TOKEN_KEY);
              await storage.remove(USER_KEY);
              setToken(null);
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // Listen for 401 session expirations from Axios interceptor
    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
      setAuthError("Session expired. Please sign in with Google again.");
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, []);

  /**
   * Reset / cancel in-flight sign-in
   */
  const cancelLogin = () => {
    isAuthenticatingRef.current = false;
    setLoading(false);
    setAuthError("");
  };

  /**
   * Google Sign-In via Supabase OAuth:
   * Uses chrome.identity.launchWebAuthFlow in Chrome Extension environment.
   */
  const googleLogin = async () => {
    if (isAuthenticatingRef.current) {
      setAuthError(
        "A sign-in request is already in progress. Please check the open Google sign-in window or click Cancel."
      );
      return;
    }

    setAuthError("");
    setLoading(true);
    isAuthenticatingRef.current = true;

    try {
      const isExtension =
        typeof chrome !== "undefined" &&
        chrome.identity &&
        typeof chrome.identity.launchWebAuthFlow === "function";

      if (!isSupabaseConfigured()) {
        throw new Error(
          "Supabase credentials not yet configured in .env. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
        );
      }

      if (isExtension) {
        // 1. Get redirect URL for this Chrome Extension: https://<extension-id>.chromiumapp.org/
        const redirectUrl = chrome.identity.getRedirectURL();

        // 2. Request Google OAuth authorization URL from Supabase
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true,
          },
        });

        if (error) throw error;
        if (!data?.url) throw new Error("No authorization URL returned from Supabase.");

        // 3. Launch interactive web auth flow window in Chrome
        const responseUrl = await new Promise((resolve, reject) => {
          chrome.identity.launchWebAuthFlow(
            {
              url: data.url,
              interactive: true,
            },
            (callbackUrl) => {
              if (chrome.runtime.lastError) {
                const msg = chrome.runtime.lastError.message || "Sign-in was cancelled.";
                if (msg.includes("Only one web auth flow")) {
                  reject(
                    new Error(
                      "A sign-in window is already active in Chrome. Please close any open Google / Ascend popups, or reload the extension in chrome://extensions and try again."
                    )
                  );
                } else if (msg.includes("user did not approve") || msg.includes("cancelled")) {
                  reject(new Error("Sign-in was cancelled."));
                } else {
                  reject(new Error(msg));
                }
              } else if (!callbackUrl) {
                reject(new Error("Sign-in was cancelled."));
              } else {
                resolve(callbackUrl);
              }
            }
          );
        });

        // 4. Extract token or code from response URL
        const urlObj = new URL(responseUrl);
        const hashParams = new URLSearchParams(urlObj.hash.replace(/^#/, ""));
        const queryParams = urlObj.searchParams;

        // Check for error in callback
        const errorDesc =
          hashParams.get("error_description") || queryParams.get("error_description");
        if (errorDesc) {
          throw new Error(decodeURIComponent(errorDesc));
        }

        let accessToken = hashParams.get("access_token") || queryParams.get("access_token");
        const code = queryParams.get("code") || hashParams.get("code");

        // PKCE flow code exchange
        if (!accessToken && code) {
          const { data: exchangeData, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          accessToken = exchangeData?.session?.access_token;
        }

        // Implicit flow or refreshed session
        const refreshToken =
          hashParams.get("refresh_token") || queryParams.get("refresh_token");
        if (accessToken && refreshToken) {
          await supabase.auth
            .setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
            .catch(() => {});
        }

        if (!accessToken) {
          throw new Error("Could not retrieve access token from Google sign-in response.");
        }

        return await completeBackendExchange(accessToken);
      } else {
        // Fallback for browser testing (Vite preview outside extension)
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      setAuthError(err.message || "Google sign-in failed. Please try again.");
      throw err;
    } finally {
      isAuthenticatingRef.current = false;
      setLoading(false);
    }
  };

  /**
   * Helper to exchange Supabase token with backend and persist JWT
   */
  const completeBackendExchange = async (supabaseAccessToken) => {
    const authData = await exchangeOAuthToken(supabaseAccessToken);
    const { token: backendToken, user: backendUser } = authData;

    if (!backendToken) {
      throw new Error("Backend did not return an Ascend authentication token.");
    }

    await storage.set(TOKEN_KEY, backendToken);
    await storage.set(USER_KEY, backendUser);

    setToken(backendToken);
    setUser(backendUser);
    return backendUser;
  };

  /**
   * Developer login bypass for local testing with an existing backend account token
   */
  const devSetToken = async (manualToken, manualUser = null) => {
    await storage.set(TOKEN_KEY, manualToken);
    setToken(manualToken);
    try {
      const freshUser = await getMe();
      await storage.set(USER_KEY, freshUser);
      setUser(freshUser);
    } catch {
      if (manualUser) {
        await storage.set(USER_KEY, manualUser);
        setUser(manualUser);
      }
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut().catch(() => {});
      }
    } finally {
      await storage.remove(TOKEN_KEY);
      await storage.remove(USER_KEY);
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        isAuthenticated: !!token && !!user,
        googleLogin,
        cancelLogin,
        logout,
        devSetToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
