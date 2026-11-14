import React from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="btn-icon rounded-md border border-border"
      title={`Theme: ${theme} (Click to switch)`}
      aria-label="Toggle color theme"
    >
      {theme === "system" ? (
        <Laptop size={16} />
      ) : resolvedTheme === "dark" ? (
        <Moon size={16} />
      ) : (
        <Sun size={16} />
      )}
    </button>
  );
}
