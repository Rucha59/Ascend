import { NavLink } from "react-router-dom";
import { Home, ListChecks, ListTodo, FolderKanban, BookOpen, BarChart3, User, LogOut, ArrowUpRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/", label: "Dashboard", Icon: Home, end: true },
  { to: "/habits", label: "Habits", Icon: ListChecks },
  { to: "/todos", label: "Tasks", Icon: ListTodo },
  { to: "/projects", label: "Projects", Icon: FolderKanban },
  { to: "/journal", label: "Journal", Icon: BookOpen },
  { to: "/analytics", label: "Analytics", Icon: BarChart3 },
  { to: "/profile", label: "Profile", Icon: User },
];

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside
      className="w-[175px] shrink-0 h-screen sticky top-0 flex flex-col"
      style={{ background: "#F5F0EB", borderRight: "1px solid #dcd3c7" }}
    >
      <div className="h-[78px] px-5 flex items-center border-b" style={{ borderColor: "#ddd4c8" }}>
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "#C85C22" }}>
          <ArrowUpRight size={18} color="#fff" strokeWidth={2.8} />
        </div>
        <span className="ml-3 font-black text-[20px] tracking-[-0.02em]" style={{ color: "#1a1714" }}>
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
              color: isActive ? "#C4521A" : "#766d63",
            })}
          >
            <Icon size={16} strokeWidth={2.1} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-5 pt-4 border-t grid gap-2" style={{ borderColor: "#ddd4c8" }}>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-2 py-2 rounded-xl text-[14px] font-medium text-left"
          style={{ color: "#766d63" }}
        >
          <LogOut size={16} strokeWidth={2.1} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
