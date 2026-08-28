import { NavLink } from "react-router-dom";
import { Home, ListChecks, BookOpen, ListTodo, FolderKanban, User, LogOut, Sprout as SproutIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/",         label: "Dashboard", Icon: Home,          end: true },
  { to: "/habits",   label: "Habits",    Icon: ListChecks,    end: false },
  { to: "/todos",    label: "To-Do",     Icon: ListTodo,      end: false },
  { to: "/projects", label: "Projects",  Icon: FolderKanban,  end: false },
  { to: "/journal",  label: "Journal",   Icon: BookOpen,      end: false },
  { to: "/profile",  label: "Profile",   Icon: User,          end: false },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
      <aside
          className="w-60 shrink-0 h-screen sticky top-0 flex flex-col p-4"
          style={{ borderRight: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 px-2 py-3">
          <SproutIcon size={20} style={{ color: "#8FBE7A" }} />
          <span className="font-display text-lg font-bold" style={{ color: "var(--text)" }}>
          Sprout
        </span>
        </div>

        <nav className="flex-1 mt-4 grid gap-1">
          {LINKS.map(({ to, label, Icon, end }) => (
              <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={({ isActive }) => ({
                    background: isActive ? "var(--surface-2)" : "transparent",
                    color: isActive ? "#FF8B6B" : "var(--text-muted)",
                  })}
              >
                <Icon size={17} />
                {label}
              </NavLink>
          ))}
        </nav>

        <div className="border-t pt-3 mt-3" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-medium px-3" style={{ color: "var(--text)" }}>{user?.name}</p>
          <p className="text-xs px-3 mb-2" style={{ color: "var(--text-muted)" }}>@{user?.username}</p>
          <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-full"
              style={{ color: "var(--text-muted)" }}
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>
  );
}
