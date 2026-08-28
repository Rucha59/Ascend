import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-full flex items-center justify-center"
      style={{ border: "1px solid var(--border)" }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={16} style={{ color: "var(--text-muted)" }} />
      ) : (
        <Moon size={16} style={{ color: "var(--text-muted)" }} />
      )}
    </button>
  );
}
