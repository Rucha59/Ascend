import React, { useState } from "react";
import { Flame, LogOut, User, ArrowUpRight, ExternalLink } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const WEBSITE_URL = "https://ascend-three-virid.vercel.app/";

export default function Header({ todayDate, dayNumber, streak = 0 }) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const formattedDate = todayDate
    ? new Date(todayDate + "T00:00:00").toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : new Date().toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

  const openWebsite = () => {
    chrome.tabs.create({ url: WEBSITE_URL });
    setShowMenu(false);
  };

  return (
    <header className="px-4 py-3 bg-surface border-b border-border sticky top-0 z-30 flex items-center justify-between">
      {/* Brand logo & today indicator */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0 text-on-primary font-bold text-xs shadow-sm">
          <ArrowUpRight size={16} strokeWidth={2.8} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[14px] text-text tracking-wide leading-none">
              ASCEND
            </span>
          </div>
          <p className="text-[11px] text-text-muted leading-tight mt-0.5 truncate">
            {formattedDate}
          </p>
        </div>
      </div>

      {/* Right side: Streak, Theme Toggle, User Menu */}
      <div className="flex items-center gap-1.5 shrink-0">
        {streak > 0 && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-pill bg-warning-surface text-warning font-bold text-[11px]"
            title={`${streak}-day streak`}
          >
            <Flame size={13} fill="currentColor" />
            <span>{streak}d</span>
          </div>
        )}

        <ThemeToggle />

        {/* User Menu Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-surface-muted border border-border flex items-center justify-center text-text font-semibold text-xs hover:border-border-strong transition-colors"
            title={user?.name || user?.email || "Account"}
            aria-label="User profile menu"
          >
            {user?.name ? user.name[0].toUpperCase() : <User size={14} />}
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-52 ascend-card p-2 z-50 shadow-popover">
                {/* User info */}
                <div className="px-2 py-1.5 border-b border-border mb-1">
                  <p className="text-[13px] font-bold text-text truncate">
                    {user?.name || "Ascend User"}
                  </p>
                  <p className="text-[11px] text-text-muted truncate">
                    {user?.email || ""}
                  </p>
                </div>

                {/* Open full app */}
                <button
                  onClick={openWebsite}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-[12px] font-medium text-text hover:bg-surface-raised rounded-md transition-colors"
                >
                  <ExternalLink size={14} className="text-text-muted" />
                  <span>Open Ascend</span>
                </button>

                {/* Sign out */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-[12px] font-medium text-danger hover:bg-danger-surface rounded-md transition-colors"
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
