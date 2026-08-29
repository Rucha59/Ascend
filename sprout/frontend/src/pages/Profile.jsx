import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Crown,
  Lock,
  LogOut,
  Mail,
  Sparkles,
  Star,
  User,
  X,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { disconnectCalendar, getCalendarAuthUrl, getCalendarStatus } from "../api/calendar";

const ACHIEVEMENTS = [
  { title: "First Habit", description: "Complete your first habit.", unlocked: true, icon: Sparkles },
  { title: "7 Day Streak", description: "Keep a streak alive for one week.", unlocked: true, icon: Star },
  { title: "30 Day Streak", description: "Build momentum across a month.", unlocked: false, icon: Crown },
  { title: "100 Habits Completed", description: "Reach a triple-digit milestone.", unlocked: false, icon: Check },
  { title: "Journal Beginner", description: "Write your first journal entry.", unlocked: true, icon: Mail },
  { title: "Consistency Master", description: "Show up day after day.", unlocked: false, icon: CalendarDays },
  { title: "Early Bird", description: "Start your day before the rest.", unlocked: false, icon: User },
];

function Modal({ title, description, children, onClose, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(10, 14, 22, 0.55)" }} onClick={onClose}>
      <div
        className={`w-full ${maxWidth} rounded-3xl p-5 md:p-6 shadow-2xl`}
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>{title}</h3>
            {description && <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{description}</p>}
          </div>
          <button onClick={onClose} className="shrink-0 p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <section className="rounded-3xl p-5 md:p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-display text-lg font-bold" style={{ color: "var(--text)" }}>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ThemePill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm font-medium"
      style={{
        background: active ? "#FF8B6B" : "var(--surface-2)",
        color: active ? "#3A1F16" : "var(--text)",
        border: `1px solid ${active ? "transparent" : "var(--border)"}`,
      }}
    >
      {children}
    </button>
  );
}

function ConfirmationOption({ title, description, highlighted = false, onConfirm, confirmLabel, confirmTone = "primary" }) {
  return (
    <div className="rounded-2xl p-4 grid gap-3" style={{ background: highlighted ? "var(--surface-2)" : "var(--bg)", border: "1px solid var(--border)" }}>
      <div>
        <h4 className="font-semibold" style={{ color: "var(--text)" }}>{title}</h4>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{description}</p>
      </div>
      <button
        type="button"
        onClick={onConfirm}
        className="w-fit px-4 py-2 rounded-xl text-sm font-semibold"
        style={{
          background: confirmTone === "danger" ? "#FF88AA" : "#FF8B6B",
          color: "#3A1F16",
        }}
      >
        {confirmLabel}
      </button>
    </div>
  );
}

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    timezone: user?.timezone || "",
  });
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState("");
  const [calendarStatus, setCalendarStatus] = useState({ connected: false });
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [restartModalOpen, setRestartModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [deleteInput, setDeleteInput] = useState("");

  useEffect(() => {
    setForm({
      name: user?.name || "",
      bio: user?.bio || "",
      timezone: user?.timezone || "",
    });
  }, [user]);

  useEffect(() => {
    let alive = true;
    getCalendarStatus()
      .then((data) => alive && setCalendarStatus(data))
      .catch(() => alive && setCalendarStatus({ connected: false }))
      .finally(() => alive && setLoadingCalendar(false));
    return () => { alive = false; };
  }, []);

  const initials = useMemo(() => {
    const source = user?.name || user?.email || "S";
    return source
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const challenge = {
    day: 18,
    length: 30,
    startDate: "2026-08-11",
    streak: 11,
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus("");
    try {
      const res = await api.patch("/users/me", form);
      setUser(res.data);
      localStorage.setItem("sprout_user", JSON.stringify(res.data));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setStatus("Couldn't save your profile right now.");
    }
  };

  const connectCalendar = async () => {
    try {
      const url = await getCalendarAuthUrl();
      window.location.href = url;
    } catch {
      setStatus("Couldn't start Google Calendar connection.");
    }
  };

  const handleDisconnectCalendar = async () => {
    try {
      await disconnectCalendar();
      setCalendarStatus({ connected: false });
      setStatus("Google Calendar disconnected.");
    } catch {
      setStatus("Couldn't disconnect Google Calendar.");
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setStatus("Password changes are ready for backend wiring.");
    setPasswordModalOpen(false);
    setPasswordForm({ current: "", next: "", confirm: "" });
  };

  const handleDeleteAccount = () => {
    setStatus("Delete account requires a backend endpoint. The confirmation flow is in place.");
    setDeleteModalOpen(false);
    setDeleteInput("");
  };

  const handleRestart = (mode) => {
    setStatus(
      mode === "keep"
        ? "Restarted from Day 1 while preserving streaks, achievements, habits, journals, and todos."
        : "Started a fresh challenge and reset the challenge day, streak, and achievements."
    );
    setRestartModalOpen(false);
  };

  return (
    <div className="pt-6 grid gap-6 pb-10 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text)" }}>Profile</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Manage your account, challenge settings, appearance, and integrations.
        </p>
      </div>

      {status && (
        <p className="text-sm px-3 py-2 rounded-xl" style={{ background: "#8FA6FF22", color: "#6D7FC8" }}>{status}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Section title="Profile" action={<button onClick={handleSave} className="font-display font-bold text-sm px-4 py-2.5 rounded-full" style={{ background: "#FF8B6B", color: "#3A1F16" }}>Save changes</button>}>
          <form onSubmit={handleSave} className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #FF8B6B, #F6C46A)" }}>
                <span className="font-display text-2xl font-bold" style={{ color: "#3A1F16" }}>{initials}</span>
              </div>
              <div>
                <p className="font-semibold" style={{ color: "var(--text)" }}>{user?.name || "Your name"}</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user?.email || "you@example.com"}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Profile picture can be connected to your account avatar later.</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm grid gap-1.5" style={{ color: "var(--text-muted)" }}>
                Name
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <User size={16} style={{ color: "var(--text-muted)" }} />
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-transparent outline-none" style={{ color: "var(--text)" }} />
                </div>
              </label>
              <label className="text-sm grid gap-1.5" style={{ color: "var(--text-muted)" }}>
                Email
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <Mail size={16} style={{ color: "var(--text-muted)" }} />
                  <input value={user?.email || ""} readOnly className="w-full bg-transparent outline-none opacity-80" style={{ color: "var(--text)" }} />
                </div>
              </label>
            </div>

            <label className="text-sm grid gap-1.5" style={{ color: "var(--text-muted)" }}>
              Bio
              <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full px-3 py-2.5 rounded-xl outline-none resize-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </label>
            <label className="text-sm grid gap-1.5" style={{ color: "var(--text-muted)" }}>
              Timezone
              <input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} placeholder="e.g. Asia/Kolkata" className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </label>

            <div className="flex items-center gap-3">
              <button type="submit" className="font-display font-bold text-sm px-4 py-2.5 rounded-full" style={{ background: "#FF8B6B", color: "#3A1F16" }}>
                Edit Profile
              </button>
              {saved && <span className="text-sm" style={{ color: "#8FBE7A" }}>Saved.</span>}
            </div>
          </form>
        </Section>

        <Section title="Challenge" action={<button onClick={() => setRestartModalOpen(true)} className="font-display font-bold text-sm px-4 py-2.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--text)" }}>Restart Challenge</button>}>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>Current Challenge Day</p>
              <p className="font-display text-3xl font-bold mt-2" style={{ color: "var(--text)" }}>{challenge.day}</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>Challenge Length</p>
              <p className="font-display text-3xl font-bold mt-2" style={{ color: "var(--text)" }}>{challenge.length} days</p>
            </div>
            <div className="rounded-2xl p-4 md:col-span-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>Start Date</p>
              <p className="font-display text-2xl font-bold mt-2" style={{ color: "var(--text)" }}>{challenge.startDate}</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Current streak: {challenge.streak} days</p>
            </div>
          </div>
        </Section>
      </div>

      <Section title="Achievements">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ACHIEVEMENTS.map(({ title, description, unlocked, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl p-4 flex gap-3"
              style={{
                background: unlocked ? "linear-gradient(180deg, var(--surface-2), var(--surface))" : "var(--surface-2)",
                border: "1px solid var(--border)",
                opacity: unlocked ? 1 : 0.78,
              }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: unlocked ? "#8FBE7A22" : "var(--surface)", border: "1px solid var(--border)" }}
              >
                {unlocked ? <Icon size={18} color="#8FBE7A" /> : <Lock size={16} color="var(--text-muted)" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold" style={{ color: "var(--text)" }}>{title}</p>
                  <span className="text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full" style={{ background: unlocked ? "#8FBE7A22" : "var(--surface)", color: unlocked ? "#4C7A3B" : "var(--text-muted)" }}>
                    {unlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Appearance">
          <div className="grid gap-3">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Theme selector</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "system", label: "System" },
              ].map((option) => (
                <ThemePill key={option.value} active={theme === option.value} onClick={() => setTheme(option.value)}>
                  {option.label}
                </ThemePill>
              ))}
            </div>
          </div>
        </Section>

        <Section
          title="Connected Accounts"
          action={loadingCalendar ? null : calendarStatus?.connected ? (
            <button onClick={handleDisconnectCalendar} className="font-display font-bold text-sm px-4 py-2.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--text)" }}>
              Disconnect
            </button>
          ) : (
            <button onClick={connectCalendar} className="font-display font-bold text-sm px-4 py-2.5 rounded-full" style={{ background: "#8FA6FF", color: "#131B33" }}>
              Connect
            </button>
          )}
        >
          <div className="flex items-center justify-between gap-4 rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div>
              <p className="font-semibold" style={{ color: "var(--text)" }}>Google Calendar</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                {loadingCalendar ? "Checking connection status…" : calendarStatus?.connected ? "Connected and syncing events." : "Not connected."}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: calendarStatus?.connected ? "#8FBE7A22" : "var(--surface)", color: calendarStatus?.connected ? "#4C7A3B" : "var(--text-muted)" }}>
              {calendarStatus?.connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </Section>
      </div>

      <Section title="Account">
        <div className="grid gap-3 sm:grid-cols-3">
          <button type="button" onClick={() => setPasswordModalOpen(true)} className="rounded-2xl p-4 text-left" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <p className="font-semibold" style={{ color: "var(--text)" }}>Change Password</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Update your login credentials.</p>
          </button>
          <button type="button" onClick={logout} className="rounded-2xl p-4 text-left" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <p className="font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}><LogOut size={16} /> Logout</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Sign out of this device.</p>
          </button>
          <button type="button" onClick={() => setDeleteModalOpen(true)} className="rounded-2xl p-4 text-left" style={{ background: "#FF88AA18", border: "1px solid #FF88AA55" }}>
            <p className="font-semibold" style={{ color: "#D1467A" }}>Delete Account</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Permanently remove your account.</p>
          </button>
        </div>
      </Section>

      {restartModalOpen && (
        <Modal
          title="Restart challenge"
          description="Choose how you'd like to restart. Both options require confirmation before anything changes."
          onClose={() => setRestartModalOpen(false)}
          maxWidth="max-w-2xl"
        >
          <div className="grid gap-3">
            <ConfirmationOption
              title="Restart from Day 1"
              description="Keep your current streak, achievements, habits, journal entries, and todos. Only the challenge day resets."
              highlighted
              confirmLabel="Confirm restart"
              onConfirm={() => handleRestart("keep")}
            />
            <ConfirmationOption
              title="Start fresh"
              description="Reset challenge day, streak, and achievements so you can begin a completely clean run."
              confirmTone="danger"
              confirmLabel="Confirm fresh start"
              onConfirm={() => handleRestart("fresh")}
            />
          </div>
        </Modal>
      )}

      {passwordModalOpen && (
        <Modal
          title="Change password"
          description="This UI is ready for a password-change endpoint when you want to connect it."
          onClose={() => setPasswordModalOpen(false)}
        >
          <form onSubmit={handlePasswordChange} className="grid gap-3">
            <input value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} type="password" placeholder="Current password" className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
            <input value={passwordForm.next} onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })} type="password" placeholder="New password" className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
            <input value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} type="password" placeholder="Confirm new password" className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setPasswordModalOpen(false)} className="px-4 py-2 rounded-xl text-sm" style={{ background: "var(--surface-2)", color: "var(--text)" }}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "#FF8B6B", color: "#3A1F16" }}>Update password</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteModalOpen && (
        <Modal
          title="Delete account"
          description="This action is permanent. Type DELETE to continue."
          onClose={() => setDeleteModalOpen(false)}
        >
          <div className="grid gap-3">
            <div className="rounded-2xl p-4" style={{ background: "#FF88AA18", border: "1px solid #FF88AA55" }}>
              <p className="text-sm" style={{ color: "#D1467A" }}>
                Deleting your account removes access to your Sprout profile and all associated account data.
              </p>
            </div>
            <input value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} placeholder='Type DELETE' className="w-full px-3 py-2.5 rounded-xl outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 rounded-xl text-sm" style={{ background: "var(--surface-2)", color: "var(--text)" }}>Cancel</button>
              <button type="button" onClick={handleDeleteAccount} disabled={deleteInput !== "DELETE"} className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: "#FF88AA", color: "#3A1F16" }}>Delete account</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
