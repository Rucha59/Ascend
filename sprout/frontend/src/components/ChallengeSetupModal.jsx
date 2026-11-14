import { useState } from "react";
import { Target, Sparkles, Check, Flame, Calendar, ArrowRight } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const PRESETS = [
  {
    days: 30,
    title: "30 Days",
    tagline: "Habit Kickstart",
    desc: "Build rapid momentum and lock in your daily rhythm.",
    badge: "Sprint",
  },
  {
    days: 75,
    title: "75 Days",
    tagline: "Ascend Standard",
    desc: "The classic mental toughness and lifestyle transformation.",
    badge: "Recommended",
    highlight: true,
  },
  {
    days: 100,
    title: "100 Days",
    tagline: "Century Run",
    desc: "Deep, enduring discipline for lasting mastery.",
    badge: "Mastery",
  },
];

export default function ChallengeSetupModal({ isOpen, onClose, onComplete }) {
  const { user, setUser } = useAuth();
  const [selectedDays, setSelectedDays] = useState(user?.challengeDays || 75);
  const [isCustom, setIsCustom] = useState(false);
  const [customDays, setCustomDays] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSelectPreset = (days) => {
    setSelectedDays(days);
    setIsCustom(false);
    setError("");
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomDays(val);
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setSelectedDays(num);
    }
    setError("");
  };

  const handleConfirm = async () => {
    const daysToSave = isCustom ? parseInt(customDays, 10) : selectedDays;

    if (!daysToSave || daysToSave < 1 || daysToSave > 365) {
      setError("Please choose a challenge duration between 1 and 365 days.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.patch("/users/me", { challengeDays: daysToSave });
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem("sprout_user", JSON.stringify(updatedUser));
      if (user?.id) {
        localStorage.setItem(`ascend_challenge_configured_${user.id}`, "true");
      }
      if (onComplete) {
        onComplete(updatedUser);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not save challenge duration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(10, 14, 22, 0.72)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--surface-card, #ffffff)",
          border: "1px solid var(--border, #e5ded2)",
          borderRadius: 24,
          padding: "28px",
          boxShadow: "0 25px 70px rgba(0,0,0,0.22)",
          color: "var(--text, #1c1714)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon & Title */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              background: "#FDE3D4",
              color: "#C85C22",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              boxShadow: "0 8px 20px rgba(200,92,34,0.15)",
            }}
          >
            <Target size={28} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            Set Your Challenge Goal
          </h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted, #7a6f64)", marginTop: 6, lineHeight: 1.45 }}>
            How many days of consistency do you want to commit to? Every habit, streak, and milestone will track toward this target.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "#FEE2E2",
              color: "#DC2626",
              fontSize: "0.82rem",
              fontWeight: 600,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* Preset Cards */}
        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          {PRESETS.map((preset) => {
            const isSelected = !isCustom && selectedDays === preset.days;
            return (
              <div
                key={preset.days}
                onClick={() => handleSelectPreset(preset.days)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: isSelected
                    ? "2px solid #C85C22"
                    : "1px solid var(--border, #e5ded2)",
                  background: isSelected
                    ? "rgba(200,92,34,0.06)"
                    : "var(--surface-2, #faf7f2)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      border: isSelected ? "2px solid #C85C22" : "2px solid #d0c6b7",
                      background: isSelected ? "#C85C22" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text, #1c1714)" }}>
                        {preset.title}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "#C85C22", fontWeight: 700 }}>
                        · {preset.tagline}
                      </span>
                      {preset.badge && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: 99,
                            background: preset.highlight ? "#C85C22" : "var(--surface, #eee7dc)",
                            color: preset.highlight ? "#fff" : "var(--text, #1c1714)",
                          }}
                        >
                          {preset.badge}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--text-muted, #7a6f64)" }}>
                      {preset.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Custom Days Option */}
          <div
            onClick={() => setIsCustom(true)}
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              border: isCustom
                ? "2px solid #C85C22"
                : "1px solid var(--border, #e5ded2)",
              background: isCustom
                ? "rgba(200,92,34,0.06)"
                : "var(--surface-2, #faf7f2)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  border: isCustom ? "2px solid #C85C22" : "2px solid #d0c6b7",
                  background: isCustom ? "#C85C22" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {isCustom && <Check size={14} strokeWidth={3} />}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text, #1c1714)" }}>
                  Custom Goal
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted, #7a6f64)", marginLeft: 6 }}>
                  Choose your own number of days (1–365)
                </span>

                {isCustom && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      placeholder="e.g. 60, 90, 180"
                      value={customDays}
                      onChange={handleCustomChange}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--border, #d0c6b7)",
                        background: "var(--surface-card, #fff)",
                        color: "var(--text, #1c1714)",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        width: 140,
                        outline: "none",
                      }}
                    />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted, #7a6f64)" }}>
                      days
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted, #7a6f64)" }}>
            You can change this or restart anytime from Profile.
          </p>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: "11px 22px",
              borderRadius: 12,
              background: "#C85C22",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: "0.92rem",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(200,92,34,0.3)",
              transition: "transform 0.1s ease",
            }}
          >
            <span>{loading ? "Saving..." : "Start Challenge"}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
