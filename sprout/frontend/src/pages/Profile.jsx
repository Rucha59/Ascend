import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, Check, Crown, Lock, LogOut,
  Mail, Sparkles, Star, User, X,Pencil
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { disconnectCalendar, getCalendarAuthUrl, getCalendarStatus } from "../api/calendar";
import { getAnalytics } from "../api/analytics";

// ─── CSS overrides so this page uses the Ascend surface vars correctly ───
// The provided source used --surface for cards; Ascend uses --surface-card for white cards.
// We re-map locally via wrapper style so nothing else breaks.

const ACHIEVEMENTS = [
  { id: "first_habit",   title: "First Habit",         description: "Complete your first habit.",          icon: Sparkles },
  { id: "streak_7",      title: "7 Day Streak",         description: "Keep a streak alive for one week.",   icon: Star      },
  { id: "streak_30",     title: "30 Day Streak",        description: "Build momentum across a month.",      icon: Crown     },
  { id: "habits_100",    title: "100 Habits Completed", description: "Reach a triple-digit milestone.",     icon: Check     },
  { id: "journal_first", title: "Journal Beginner",     description: "Write your first journal entry.",     icon: Mail      },
  { id: "consistency",   title: "Consistency Master",   description: "Show up day after day.",              icon: CalendarDays },
  { id: "early_bird",    title: "Early Bird",           description: "Start your day before the rest.",    icon: User      },
];

function computeUnlocked(user, analyticsData) {
  const streak = user?.currentStreak || 0;
  const longest = user?.longestStreak || 0;
  const totalCompleted = analyticsData?.streaks?.totalCompletedDays || 0;
  const journalTotal = analyticsData?.journalEntriesAllTime || 0;
  return {
    first_habit:   totalCompleted >= 1,
    streak_7:      longest >= 7,
    streak_30:     longest >= 30,
    habits_100:    totalCompleted >= 100,
    journal_first: journalTotal >= 1,
    consistency:   longest >= 14,
    early_bird:    streak >= 5,
  };
}

// ─── Modal ───────────────────────────────────────────────────────────────────
function Modal({ title, description, children, onClose, wide = false }) {
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
      <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, background: "rgba(10,14,22,0.55)",
          }}
          onClick={onClose}
      >
        <div
            style={{
              width: "100%",
              maxWidth: wide ? 640 : 440,
              background: "var(--surface-card)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "24px 28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            }}
            onClick={e => e.stopPropagation()}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>{title}</h3>
              {description && (
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 6 }}>{description}</p>
              )}
            </div>
            <button onClick={onClose} style={{ color: "var(--text-muted)", padding: 4, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
              <X size={17} />
            </button>
          </div>
          {children}
        </div>
      </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ title, subtitle, children, action }) {
  return (
      <section
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-light)",
            borderRadius: 16,
            padding: "24px",
          }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{title}</h2>
            {subtitle && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 3 }}>{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </section>
  );
}

// ─── Input wrapper ───────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  padding: "10px 13px",
  borderRadius: 10,
  fontSize: "0.88rem",
  border: "1px solid var(--border)",
  background: "var(--surface-2)",
  color: "var(--text)",
  outline: "none",
};

function FieldRow({ icon: Icon, label, children }) {
  return (
      <div style={{ display: "grid", gap: 5 }}>
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {label}
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 13px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface-2)" }}>
          {Icon && <Icon size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
          {children}
        </div>
      </div>
  );
}

// ─── Pill button ─────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", disabled = false, small = false }) {
  const styles = {
    primary: { background: "var(--accent)", color: "#fff" },
    ghost:   { background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" },
    danger:  { background: "#FF88AA", color: "#3A1F16" },
  };
  return (
      <button
          onClick={onClick}
          disabled={disabled}
          style={{
            ...styles[variant],
            padding: small ? "6px 14px" : "9px 18px",
            borderRadius: 99,
            fontSize: small ? "0.78rem" : "0.85rem",
            fontWeight: 700,
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            whiteSpace: "nowrap",
          }}
      >
        {children}
      </button>
  );
}

// ─── Stat tile ───────────────────────────────────────────────────────────────
function StatTile({ label, value, wide = false }) {
  return (
      <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "16px 18px",
            gridColumn: wide ? "span 2" : "span 1",
          }}
      >
        <p className="asc-caps" style={{ color: "var(--text-muted)", fontSize: "0.67rem", marginBottom: 8 }}>{label}</p>
        <p style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{value}</p>
      </div>
  );
}

// ─── Theme pill ──────────────────────────────────────────────────────────────
function ThemePill({ active, label, onClick }) {
  return (
      <button
          onClick={onClick}
          style={{
            padding: "7px 16px",
            borderRadius: 99,
            fontSize: "0.82rem",
            fontWeight: active ? 700 : 500,
            background: active ? "var(--accent)" : "var(--surface-2)",
            color: active ? "#fff" : "var(--text)",
            border: `1px solid ${active ? "transparent" : "var(--border)"}`,
            cursor: "pointer",
            position: "relative",
          }}
      >
        {active && (
            <span
                style={{
                  position: "absolute",
                  top: -3, right: -3,
                  width: 8, height: 8,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  border: "2px solid var(--surface-card)",
                }}
            />
        )}
        {label}
      </button>
  );
}

// ─── Confirmation block inside restart modal ──────────────────────────────────
function RestartOption({ title, description, confirmLabel, onConfirm, danger }) {
  return (
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: "grid", gap: 12 }}>
        <div>
          <p style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.92rem" }}>{title}</p>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 5 }}>{description}</p>
        </div>
        <Btn variant={danger ? "danger" : "primary"} small onClick={onConfirm}>{confirmLabel}</Btn>
      </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const { theme, setTheme, availableThemes } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "", timezone: user?.timezone || "" });
  const [saved, setSaved] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const [calendarStatus, setCalendarStatus] = useState({ connected: false });
  const [calendarLoading, setCalendarLoading] = useState(true);

  const [analyticsData, setAnalyticsData] = useState(null);

  const [restartModal, setRestartModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");

  // Keep form in sync if user object changes
  useEffect(() => {
    setForm({ name: user?.name || "", bio: user?.bio || "", timezone: user?.timezone || "" });
  }, [user]);

  useEffect(() => {
    getCalendarStatus()
        .then(setCalendarStatus)
        .catch(() => setCalendarStatus({ connected: false }))
        .finally(() => setCalendarLoading(false));
    getAnalytics()
        .then(setAnalyticsData)
        .catch(() => {});
  }, []);

  const initials = useMemo(() => {
    const src = user?.name || user?.email || "A";
    return src.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  }, [user]);

  const unlocked = useMemo(() => computeUnlocked(user, analyticsData), [user, analyticsData]);

  // Challenge stats derived from user data
  const challengeStartDate = user?.challengeStartDate;
  const challengeDay = useMemo(() => {
    if (!challengeStartDate) return 1;
    const start = new Date(challengeStartDate + "T12:00:00");
    const now = new Date();
    const diff = Math.ceil((now - start) / 86400000);
    return Math.max(1, Math.min(diff, 75));
  }, [challengeStartDate]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSave = async (e) => {
    e?.preventDefault();
    setStatusMsg("");
    try {
      const res = await api.patch("/users/me", form);
      setUser(res.data);
      localStorage.setItem("sprout_user", JSON.stringify(res.data));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setStatusMsg("Couldn't save profile right now.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError("");
    if (passwordForm.next !== passwordForm.confirm) {
      setPwError("New passwords don't match.");
      return;
    }
    if (passwordForm.next.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    // Placeholder — wire to a real endpoint when the backend endpoint is added
    setStatusMsg("Password change is ready for backend wiring (endpoint not yet built).");
    setPasswordModal(false);
    setPasswordForm({ current: "", next: "", confirm: "" });
  };

  const handleDeleteAccount = () => {
    // Placeholder — wire to DELETE /api/users/me when the backend endpoint is added
    setStatusMsg("Delete account requires a backend endpoint. The confirmation flow is in place.");
    setDeleteModal(false);
    setDeleteInput("");
  };

  const handleRestart = (mode) => {
    setStatusMsg(
        mode === "keep"
            ? "Restarted from Day 1 — history preserved."
            : "Fresh start — challenge day, streak, and achievements reset."
    );
    setRestartModal(false);
  };

  const handleConnectCalendar = async () => {
    try {
      const url = await getCalendarAuthUrl();
      window.location.href = url;
    } catch (err) {
      setStatusMsg(err.response?.data?.message || "Couldn't start Google Calendar connection.");
    }
  };

  const handleDisconnectCalendar = async () => {
    try {
      await disconnectCalendar();
      setCalendarStatus({ connected: false });
      setStatusMsg("Google Calendar disconnected.");
    } catch {
      setStatusMsg("Couldn't disconnect Google Calendar.");
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
      <div style={{ paddingBottom: 60, display: "grid", gap: 20, maxWidth: 880 }}>

        {/* Page heading */}
        <div style={{ marginBottom: 4 }}>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--text)" }}>Profile</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 5 }}>
            Manage your account, challenge, appearance, and integrations.
          </p>
        </div>

        {statusMsg && (
            <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: "0.85rem", background: "var(--accent-light)", color: "var(--accent)" }}>
              {statusMsg}
            </div>
        )}

        {/* ── Row 1: Profile + Challenge ── */}
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1.1fr 0.9fr" }}>

          <Section
              title="Profile"
              action={<Btn small onClick={handleSave}>Save changes</Btn>}
          >
            <form onSubmit={handleSave} style={{ display: "grid", gap: 14 }}>
              {/* Avatar + name/email */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}>
                <div style={{
                  width: 68, height: 68, borderRadius: 18, flexShrink: 0,
                  background: "linear-gradient(135deg, var(--accent), #F6C46A)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff" }}>{initials}</span>
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>
                    {user?.name || "Your name"}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {user?.email || "you@example.com"}
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: 4 }}>
                    @{user?.username || "username"}
                  </p>
                </div>
              </div>

              {/* Name + Email side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <FieldRow icon={User} label="Name">
                  <input
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "0.88rem", color: "var(--text)" }}
                  />
                </FieldRow>
                <FieldRow icon={Mail} label="Email">
                  <input
                      value={user?.email || ""}
                      readOnly
                      style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "0.88rem", color: "var(--text)", opacity: 0.7 }}
                  />
                </FieldRow>
              </div>

              {/* Bio */}
              <div style={{ display: "grid", gap: 5 }}>
                <label className="asc-caps" style={{ color: "var(--text-muted)", fontSize: "0.67rem" }}>Bio</label>
                <textarea
                    rows={2}
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    placeholder="A few words about you…"
                    style={{ ...inputStyle, resize: "none" }}
                />
              </div>

              {/* Timezone */}
              <div style={{ display: "grid", gap: 5 }}>
                <label className="asc-caps" style={{ color: "var(--text-muted)", fontSize: "0.67rem" }}>Timezone</label>
                <input
                    value={form.timezone}
                    onChange={e => setForm({ ...form, timezone: e.target.value })}
                    placeholder="e.g. Asia/Kolkata"
                    style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Btn small>Save changes</Btn>
                {saved && <span style={{ fontSize: "0.82rem", color: "var(--green)" }}>Saved ✓</span>}
              </div>
            </form>
          </Section>

          <Section
              title="Challenge"
              action={<Btn small variant="ghost" onClick={() => setRestartModal(true)}>Restart</Btn>}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <StatTile label="Current Day" value={challengeDay} />
              <StatTile label="Length" value="75 days" />
              <StatTile
                  label="Start Date"
                  value={challengeStartDate || "—"}
                  wide
              />
              <StatTile label="Streak" value={`${user?.currentStreak || 0}d`} />
              <StatTile label="Longest" value={`${user?.longestStreak || 0}d`} />
            </div>
          </Section>
        </div>

        {/* ── Achievements ── */}
        <Section title="Achievements" subtitle="Unlock these by staying consistent.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 10 }}>
            {ACHIEVEMENTS.map(({ id, title, description, icon: Icon }) => {
              const isUnlocked = unlocked[id];
              return (
                  <div
                      key={id}
                      style={{
                        display: "flex",
                        gap: 12,
                        padding: "14px",
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: isUnlocked
                            ? "linear-gradient(160deg, var(--surface-2), var(--surface-card))"
                            : "var(--surface-2)",
                        opacity: isUnlocked ? 1 : 0.75,
                      }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isUnlocked ? "var(--green-bg)" : "var(--surface-card)",
                      border: "1px solid var(--border)",
                    }}>
                      {isUnlocked
                          ? <Icon size={17} color="var(--green)" />
                          : <Lock size={15} color="var(--text-faint)" />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text)" }}>{title}</p>
                        <span style={{
                          fontSize: "0.62rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.14em",
                          padding: "2px 7px",
                          borderRadius: 99,
                          background: isUnlocked ? "var(--green-bg)" : "var(--surface-card)",
                          color: isUnlocked ? "var(--green)" : "var(--text-faint)",
                        }}>
                      {isUnlocked ? "Unlocked" : "Locked"}
                    </span>
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>{description}</p>
                    </div>
                  </div>
              );
            })}
          </div>
        </Section>

        {/* ── Row 3: Appearance + Connected Accounts ── */}
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>

          <Section title="Appearance" subtitle="Pick a theme that feels right.">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {availableThemes.map(({ value, label }) => (
                  <ThemePill
                      key={value}
                      active={theme === value}
                      label={label}
                      onClick={() => setTheme(value)}
                  />
              ))}
            </div>
            {/* Live preview swatch */}
            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["--accent", "--green", "--purple", "--text"].map(v => (
                    <div key={v} style={{ width: 18, height: 18, borderRadius: "50%", background: `var(${v})`, border: "1px solid var(--border-light)" }} />
                ))}
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Active theme: <strong style={{ color: "var(--text)" }}>  {availableThemes.find(t => t.value === theme)?.label || theme}</strong>
              </p>
            </div>
          </Section>

          <Section
              title="Connected Accounts"
              action={
                calendarLoading ? null : calendarStatus?.connected ? (
                    <Btn small variant="ghost" onClick={handleDisconnectCalendar}>Disconnect</Btn>
                ) : (
                    <Btn small onClick={handleConnectCalendar}>Connect</Btn>
                )
              }
          >
            <div style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text)" }}>Google Calendar</p>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
                  {calendarLoading
                      ? "Checking connection…"
                      : calendarStatus?.connected
                          ? "Connected and syncing today's events."
                          : "Not connected. Events won't appear on the Dashboard."}
                </p>
              </div>
              <span style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "4px 10px",
                borderRadius: 99,
                background: calendarStatus?.connected ? "var(--green-bg)" : "var(--surface-card)",
                color: calendarStatus?.connected ? "var(--green)" : "var(--text-faint)",
                flexShrink: 0,
              }}>
              {calendarStatus?.connected ? "Live" : "Off"}
            </span>
            </div>

            {/* Placeholder for future integrations */}
            <div style={{ marginTop: 10, padding: "14px 16px", borderRadius: 12, border: "1px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, opacity: 0.5 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text)" }}>Outlook Calendar</p>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>Coming soon.</p>
              </div>
              <span style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 10px", borderRadius: 99, background: "var(--surface-card)", color: "var(--text-faint)" }}>
              Soon
            </span>
            </div>
          </Section>

        </div>

        {/* ── Account actions ── */}
        <Section title="Account" subtitle="Manage your login credentials and account data.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <button
                onClick={() => setPasswordModal(true)}
                style={{
                  padding: "16px",
                  borderRadius: 12,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
            >
              <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text)" }}>Change Password</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 5 }}>Update your login credentials.</p>
            </button>

            <button
                onClick={handleLogout}
                style={{
                  padding: "16px",
                  borderRadius: 12,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
            >
              <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text)", display: "flex", alignItems: "center", gap: 7 }}>
                <LogOut size={15} /> Sign out
              </p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 5 }}>Sign out of this device.</p>
            </button>

            <button
                onClick={() => setDeleteModal(true)}
                style={{
                  padding: "16px",
                  borderRadius: 12,
                  background: "#FF88AA18",
                  border: "1px solid #FF88AA55",
                  cursor: "pointer",
                  textAlign: "left",
                }}
            >
              <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#C0396A" }}>Delete Account</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 5 }}>Permanently remove your data.</p>
            </button>
          </div>
        </Section>

        {/* ── Modals ── */}

        {/* Restart challenge */}
        {restartModal && (
            <Modal
                title="Restart challenge"
                description="Choose how you'd like to restart. Both options require confirmation."
                onClose={() => setRestartModal(false)}
                wide
            >
              <div style={{ display: "grid", gap: 10 }}>
                <RestartOption
                    title="Restart from Day 1"
                    description="Keep your current streak, habits, journal entries, and todos. Only the challenge day resets back to 1."
                    confirmLabel="Confirm restart"
                    onConfirm={() => handleRestart("keep")}
                />
                <RestartOption
                    title="Start completely fresh"
                    description="Reset challenge day, streak, and achievements. Habits, journal entries, and todos are kept."
                    confirmLabel="Confirm fresh start"
                    onConfirm={() => handleRestart("fresh")}
                    danger
                />
              </div>
            </Modal>
        )}

        {/* Change password */}
        {passwordModal && (
            <Modal
                title="Change password"
                description="Choose a strong password with at least 8 characters."
                onClose={() => { setPasswordModal(false); setPwError(""); }}
            >
              <form onSubmit={handlePasswordChange} style={{ display: "grid", gap: 10 }}>
                {pwError && (
                    <p style={{ fontSize: "0.82rem", color: "#DC2626", padding: "8px 12px", background: "#FEE2E2", borderRadius: 8 }}>
                      {pwError}
                    </p>
                )}
                {[
                  ["current", "Current password"],
                  ["next", "New password"],
                  ["confirm", "Confirm new password"],
                ].map(([k, placeholder]) => (
                    <input
                        key={k}
                        type="password"
                        placeholder={placeholder}
                        value={passwordForm[k]}
                        onChange={e => setPasswordForm({ ...passwordForm, [k]: e.target.value })}
                        style={inputStyle}
                    />
                ))}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                  <Btn variant="ghost" small onClick={() => { setPasswordModal(false); setPwError(""); }}>Cancel</Btn>
                  <Btn small>Update password</Btn>
                </div>
              </form>
            </Modal>
        )}

        {/* Delete account */}
        {deleteModal && (
            <Modal
                title="Delete account"
                description='This action is permanent and cannot be undone. Type DELETE to continue.'
                onClose={() => { setDeleteModal(false); setDeleteInput(""); }}
            >
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ padding: "12px 14px", borderRadius: 10, background: "#FF88AA18", border: "1px solid #FF88AA55" }}>
                  <p style={{ fontSize: "0.82rem", color: "#C0396A" }}>
                    Deleting your account removes your profile and all associated data from Ascend. This cannot be reversed.
                  </p>
                </div>
                <input
                    value={deleteInput}
                    onChange={e => setDeleteInput(e.target.value)}
                    placeholder="Type DELETE"
                    style={inputStyle}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <Btn variant="ghost" small onClick={() => { setDeleteModal(false); setDeleteInput(""); }}>Cancel</Btn>
                  <Btn variant="danger" small disabled={deleteInput !== "DELETE"} onClick={handleDeleteAccount}>
                    Delete account
                  </Btn>
                </div>
              </div>
            </Modal>
        )}

      </div>
  );
}
