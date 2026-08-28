import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { getCalendarAuthUrl } from "../api/calendar";
import { useAuth } from "../context/AuthContext";

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [status, setStatus] = useState("Signing you in...");
  const [error, setError] = useState("");
  const [userCreated, setUserCreated] = useState(false);
  const [readyForCalendar, setReadyForCalendar] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const responseError = searchParams.get("error");
    const created = searchParams.get("created") === "true";

    if (responseError) {
      setError("Google sign-in failed. Please try again.");
      setStatus("");
      return;
    }

    if (!token) {
      setError("Missing sign-in token.");
      setStatus("");
      return;
    }

    localStorage.setItem("sprout_token", token);
    api.get("/users/me").then((res) => {
      localStorage.setItem("sprout_user", JSON.stringify(res.data));
      setUser(res.data);
      setUserCreated(created);
      setReadyForCalendar(true);
      setStatus("");
    }).catch(() => {
      setError("Signed in, but couldn't load your account.");
      setStatus("");
    });
  }, [searchParams, setUser]);

  const chooseCalendar = async (shouldSync) => {
    if (shouldSync) {
      try {
        const url = await getCalendarAuthUrl();
        window.location.href = url;
        return;
      } catch (err) {
        setError(err.response?.data?.message || "Couldn't start Google Calendar sync.");
        return;
      }
    }

    navigate("/", { replace: true });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
        <div className="max-w-md w-full rounded-3xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p style={{ color: "var(--text)" }}>{error}</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="mt-4 font-display font-bold text-sm px-4 py-2.5 rounded-full"
            style={{ background: "#FF8B6B", color: "#3A1F16" }}
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="max-w-md w-full rounded-3xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        {!readyForCalendar ? (
          <p style={{ color: "var(--text)" }}>{status}</p>
        ) : (
          <>
            <h1 className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>Google sign-in complete</h1>
            <p className="mt-2" style={{ color: "var(--text-muted)" }}>
              {userCreated
                ? "Your Sprout account was created from Google."
                : "We found your existing Sprout account and signed you in."}
            </p>
            <p className="mt-4" style={{ color: "var(--text)" }}>Do you want to sync Google Calendar too?</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => chooseCalendar(true)}
                className="font-display font-bold text-sm px-4 py-2.5 rounded-full"
                style={{ background: "#FF8B6B", color: "#3A1F16" }}
              >
                Yes, sync calendar
              </button>
              <button
                onClick={() => chooseCalendar(false)}
                className="font-display font-bold text-sm px-4 py-2.5 rounded-full"
                style={{ background: "var(--surface-2)", color: "var(--text)" }}
              >
                No thanks
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
