import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Safety net: if loading hasn't resolved after 8 seconds, stop waiting.
  // This prevents an infinite spinner if the backend is cold-starting and
  // there's no cached user to show immediately.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading && !timedOut) {
    return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          background: "var(--bg)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--logo-bg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.2rem",
          }}>↗</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Loading Ascend…</p>
        </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
