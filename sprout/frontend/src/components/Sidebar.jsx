import { NavLink, useNavigate } from "react-router-dom";
import { Home, ListChecks, ListTodo, FolderKanban, BookOpen, BarChart3, User, LogOut, ArrowUpRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", Icon: Home, end: true },
  { to: "/habits", label: "Habits", Icon: ListChecks },
  { to: "/todos", label: "Tasks", Icon: ListTodo },
  { to: "/projects", label: "Projects", Icon: FolderKanban },
  { to: "/journal", label: "Journal", Icon: BookOpen },
  { to: "/analytics", label: "Analytics", Icon: BarChart3 },
  { to: "/profile", label: "Profile", Icon: User },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate("/");
    };
  return (
    <aside
      className="w-[175px] shrink-0 h-screen sticky top-0 flex flex-col"
      style={{
        background: "var(--surface)",
        borderRight: "1px solid var(--border)"
      }}    >
      <div className="h-[78px] px-5 flex items-center border-b" style={{ borderColor: "#ddd4c8" }}>
        <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--surface-2)",
              border: "2px solid var(--accent)",
              boxShadow: "0 4px 12px rgba(192,90,32,0.12)"
            }}
        >
          <ArrowUpRight
              size={19}
              color="var(--accent)"
              strokeWidth={2.8}
          />
        </div>

        <span
            className="ml-3 font-black text-[20px] tracking-[-0.02em]"
            style={{ color: "var(--text)" }}
        >
  ASCEND
</span>
      </div>

      <nav className="flex-1 px-4 py-6 grid gap-3 content-start">
        {LINKS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex items-center gap-3 px-2 py-2 rounded-xl text-[14px] font-medium"
            style={({ isActive }) => ({
              color: isActive ? "var(--accent)" : "var(--text-muted)",
            })}
          >
            <Icon size={16} strokeWidth={2.1} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-5 pt-4 border-t grid gap-2" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-2 py-2 rounded-xl text-[14px] font-medium text-left"
          style={{ color: "var(--text-muted)" }}
        >
          <LogOut size={16} strokeWidth={2.1} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
