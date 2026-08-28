import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = "sprout_theme";
const AVAILABLE_THEMES = [
  { value: "light", label: "Blush" },
  { value: "dark", label: "Midnight" },
  { value: "forest", label: "Forest" },
  { value: "ocean", label: "Ocean" },
  { value: "dusk", label: "Dusk" },
  { value: "paper", label: "Paper" },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) || "light");

  useEffect(() => {
    const root = document.documentElement;
    AVAILABLE_THEMES.forEach(({ value }) => {
      root.classList.remove(value);
    });
    root.classList.add(theme);
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return <ThemeContext.Provider value={{ theme, setTheme, toggle, availableThemes: AVAILABLE_THEMES }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
