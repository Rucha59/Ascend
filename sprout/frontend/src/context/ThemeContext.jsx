import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = "sprout_theme";
const AVAILABLE_THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) || "light");
  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme());

  useEffect(() => {
    const root = document.documentElement;
    AVAILABLE_THEMES.forEach(({ value }) => {
      root.classList.remove(value);
    });
    const resolvedTheme = theme === "dark" ? "dark" : "paper";
    root.classList.add(resolvedTheme);
    root.classList.toggle("dark", resolvedTheme === "dark");
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, systemTheme]);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return undefined;
    const onChange = (e) => setSystemTheme(e.matches ? "dark" : "light");
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  const resolvedTheme = theme === "dark" ? "dark" : "paper";
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggle, availableThemes: AVAILABLE_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
