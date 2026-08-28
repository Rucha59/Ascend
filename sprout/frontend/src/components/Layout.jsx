import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";

export default function Layout() {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar />
      <div className="flex-1 min-w-0">
        <header className="flex justify-end px-6 md:px-8 py-4 md:py-5">
          <ThemeToggle />
        </header>
        <main className="px-6 md:px-8 pb-10 w-full max-w-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
