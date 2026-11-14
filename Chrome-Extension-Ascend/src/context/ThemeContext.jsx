import React, { createContext, useContext, useEffect, useState } from "react";
import { storage } from "../lib/storage";

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = "ascend_theme";

function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [themePreference, setThemePreference] = useState("system"); // 'light' | 'dark' | 'system'
  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme());
  const [mounted, setMounted] = useState(false);

  // Load stored theme on mount
  useEffect(() => {
    async function loadStoredTheme() {
      const stored = await storage.get(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemePreference(stored);
      }
      setMounted(true);
    }
    loadStoredTheme();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemTheme(e.matches ? "dark" : "light");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Resolve active theme: either explicit or OS preference
  const resolvedTheme = themePreference === "system" ? systemTheme : themePreference;

  // Apply data-theme attribute and dark class to document root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", resolvedTheme);
    root.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  const setTheme = async (newPref) => {
    setThemePreference(newPref);
    await storage.set(THEME_STORAGE_KEY, newPref);
  };

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: themePreference,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isDark: resolvedTheme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
