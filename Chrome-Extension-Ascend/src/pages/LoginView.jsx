import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ArrowUpRight, AlertCircle, Key, Loader2 } from "lucide-react";
import ThemeToggle from "../components/layout/ThemeToggle";

export default function LoginView() {
  const { googleLogin, cancelLogin, devSetToken, authError, loading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [slowWarning, setSlowWarning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showDevInput, setShowDevInput] = useState(false);
  const [manualToken, setManualToken] = useState("");

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setSlowWarning(false);
    setSigningIn(true);

    // Show a "waking up" hint after 10s — Render free tier cold-starts can take ~60s
    const slowTimer = setTimeout(() => setSlowWarning(true), 10000);

    try {
      await googleLogin();
    } catch (err) {
      setErrorMsg(err.message || "Google sign-in was cancelled or failed.");
    } finally {
      clearTimeout(slowTimer);
      setSigningIn(false);
      setSlowWarning(false);
    }
  };

  const handleCancel = () => {
    cancelLogin();
    setSigningIn(false);
    setSlowWarning(false);
    setErrorMsg("");
  };

  const handleManualDevLogin = async (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    try {
      await devSetToken(manualToken.trim());
    } catch (err) {
      setErrorMsg("Invalid token. Please check your Ascend backend JWT.");
    }
  };

  return (
    <div className="min-h-screen bg-page flex flex-col justify-between p-5">
      {/* Top Bar with Theme Toggle */}
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-sm mx-auto ascend-card p-5 shadow-card space-y-4 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center space-y-1.5">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
            <ArrowUpRight size={24} strokeWidth={2.8} />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-text tracking-wide">
              ASCEND
            </h1>
            <p className="text-[11px] text-text-secondary">
              Habit &amp; Productivity Companion
            </p>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-surface-raised p-2.5 rounded-md border border-border text-left space-y-1">
          <p className="text-[11px] font-semibold text-text">
            Stay in flow while browsing
          </p>
          <p className="text-[10px] text-text-muted leading-relaxed">
            Quickly check off daily habits, add today's tasks, and track active project milestones directly from Chrome's side panel.
          </p>
        </div>

        {/* Error Alert */}
        {(errorMsg || authError) && (
          <div className="flex items-start gap-2 p-2.5 rounded bg-danger-surface text-danger text-left text-[11px] leading-snug">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <span>{errorMsg || authError}</span>
              {(errorMsg?.includes("active in Chrome") || authError?.includes("active in Chrome")) && (
                <p className="text-[10px] text-text-muted">
                  Tip: Close any open Google sign-in popups, or go to <code>chrome://extensions</code> and click the Reload icon on Ascend.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Slow connection hint */}
        {signingIn && slowWarning && (
          <p className="text-[10px] text-text-muted text-center animate-pulse">
            Taking a moment — please wait…
          </p>
        )}

        {/* Primary Action: Google Sign-In */}
        <div className="space-y-2">
          <button
            onClick={handleGoogleSignIn}
            disabled={signingIn || loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-md bg-white border border-border text-[#3c4043] font-semibold text-[13px] hover:bg-[#f8f9fa] hover:border-border-strong active:scale-[0.99] shadow-sm transition-all disabled:opacity-60"
          >
            {signingIn ? (
              <Loader2 size={18} className="animate-spin text-primary" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
              </svg>
            )}
            <span>{signingIn ? "Signing you in…" : "Continue with Google"}</span>
          </button>

          {signingIn && (
            <button
              onClick={handleCancel}
              className="text-[11px] text-text-muted hover:text-text underline py-0.5"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Developer Quick-Login Toggle */}
        <div className="pt-2 border-t border-border">
          <button
            onClick={() => setShowDevInput((prev) => !prev)}
            className="text-[11px] text-text-muted hover:text-text flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <Key size={11} />
            <span>Developer token input</span>
          </button>

          {showDevInput && (
            <form onSubmit={handleManualDevLogin} className="mt-2 space-y-2 text-left">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste Sprout JWT token…"
                className="w-full bg-surface-raised border border-border text-[11px] rounded p-2 outline-none text-text"
              />
              <button type="submit" className="btn-primary w-full text-[11px] py-1.5">
                Sign in with Dev Token
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[10px] text-text-muted">
        Connected to your Ascend account · One source of truth
      </footer>
    </div>
  );
}


