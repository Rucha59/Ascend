import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function getBackendOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      if (data?.fieldErrors) setFieldErrors(data.fieldErrors);
      setError(data?.message || "Couldn't create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = () => {
    window.location.href = `${getBackendOrigin()}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm rounded-3xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-6">
          <Sprout size={22} style={{ color: "#8FBE7A" }} />
          <span className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>Sprout</span>
        </div>

        <h1 className="font-display text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>Start your 75 days</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>A few details and you're in.</p>

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
          <div>
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={update("name")}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            {fieldErrors.name && <p className="text-xs mt-1" style={{ color: "#D1467A" }}>{fieldErrors.name}</p>}
          </div>
          <div>
            <input
              required
              placeholder="Username"
              value={form.username}
              onChange={update("username")}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            {fieldErrors.username && <p className="text-xs mt-1" style={{ color: "#D1467A" }}>{fieldErrors.username}</p>}
          </div>
          <div>
            <input
              type="email"
              required
              placeholder="Email"
              value={form.email}
              onChange={update("email")}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            {fieldErrors.email && <p className="text-xs mt-1" style={{ color: "#D1467A" }}>{fieldErrors.email}</p>}
          </div>
          <div>
            <input
              type="password"
              required
              placeholder="Password (min. 8 characters)"
              value={form.password}
              onChange={update("password")}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            {fieldErrors.password && <p className="text-xs mt-1" style={{ color: "#D1467A" }}>{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="font-display font-bold text-sm px-4 py-2.5 rounded-full mt-2 disabled:opacity-60"
            style={{ background: "#FF8B6B", color: "#3A1F16" }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm mt-5 text-center" style={{ color: "var(--text-muted)" }}>
          Already growing something?{" "}
          <Link to="/login" style={{ color: "#FF8B6B", fontWeight: 600 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
