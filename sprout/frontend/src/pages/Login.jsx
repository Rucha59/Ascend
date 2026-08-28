import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function getBackendOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't log you in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = () => {
    window.location.href = `${getBackendOrigin()}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm rounded-3xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-6">
          <Sprout size={22} style={{ color: "#8FBE7A" }} />
          <span className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>Sprout</span>
        </div>

        <h1 className="font-display text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>Welcome back</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Log in to pick up where you left off.</p>

        {error && (
          <p className="text-sm mb-4 px-3 py-2 rounded-xl" style={{ background: "#FF88AA22", color: "#D1467A" }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full font-display font-bold text-sm px-4 py-2.5 rounded-full mb-4"
          style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
        >
          Continue with Google
        </button>

        <form onSubmit={submit} className="grid gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="font-display font-bold text-sm px-4 py-2.5 rounded-full mt-2 disabled:opacity-60"
            style={{ background: "#FF8B6B", color: "#3A1F16" }}
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-sm mt-5 text-center" style={{ color: "var(--text-muted)" }}>
          New here?{" "}
          <Link to="/register" style={{ color: "#FF8B6B", fontWeight: 600 }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
