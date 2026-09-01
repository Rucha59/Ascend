import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function getBackendOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.username, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(
          err.response?.data?.message ||
          "Couldn't log you in. Check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = () => {
    window.location.href = `${getBackendOrigin()}/oauth2/authorization/google`;
  };

  return (
      <div
          className="min-h-screen flex items-center justify-center px-6 py-12"
          style={{ background: "#f2ede6" }}
      >
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#d95a2b" }}
              >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                >
                  <path
                      d="M4 15L15 4M15 4H8M15 4V11"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                  />
                </svg>
              </div>

              <span
                  className="font-display text-xl font-black tracking-widest"
                  style={{ color: "#1c1714" }}
              >
              ASCEND
            </span>
            </Link>
          </div>

          {/* Main card */}
          <div
              className="rounded-[28px] p-7 sm:p-9"
              style={{
                background: "#faf7f2",
                border: "1px solid #ddd5c8",
                boxShadow: "0 20px 60px rgba(28, 23, 20, 0.08)",
              }}
          >
            <div className="mb-7">
              <p
                  className="text-xs font-semibold tracking-widest uppercase mb-3"
                  style={{ color: "#d95a2b" }}
              >
                Welcome back
              </p>

              <h1
                  className="font-display font-black text-3xl sm:text-4xl"
                  style={{ color: "#1c1714" }}
              >
                Keep your momentum going.
              </h1>

              <p
                  className="text-sm mt-3 leading-relaxed"
                  style={{ color: "#8a7d72" }}
              >
                Log in to continue your challenge, habits, projects and daily
                progress.
              </p>
            </div>

            {error && (
                <div
                    className="text-sm mb-5 px-4 py-3 rounded-xl"
                    style={{
                      background: "#ff88aa22",
                      color: "#b83c67",
                      border: "1px solid #ff88aa55",
                    }}
                >
                  {error}
                </div>
            )}

            {/* Google */}
            {/*<button*/}
            {/*    type="button"*/}
            {/*    onClick={signInWithGoogle}*/}
            {/*    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"*/}
            {/*    style={{*/}
            {/*      background: "#ffffff",*/}
            {/*      color: "#1c1714",*/}
            {/*      border: "1px solid #ddd5c8",*/}
            {/*    }}*/}
            {/*>*/}
            {/*  <svg width="18" height="18" viewBox="0 0 24 24">*/}
            {/*    <path*/}
            {/*        fill="#4285F4"*/}
            {/*        d="M21.35 12.27c0-.78-.07-1.53-.23-2.27H12v4.3h5.22a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.93-4.18 2.93-7.39Z"*/}
            {/*    />*/}
            {/*    <path*/}
            {/*        fill="#34A853"*/}
            {/*        d="M12 21.5c2.63 0 4.84-.87 6.45-2.34l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.55 0-4.71-1.72-5.49-4.04H3.26v2.5A9.74 9.74 0 0 0 12 21.5Z"*/}
            {/*    />*/}
            {/*    <path*/}
            {/*        fill="#FBBC05"*/}
            {/*        d="M6.51 13.61a5.84 5.84 0 0 1 0-3.72V7.39H3.26a9.5 9.5 0 0 0 0 8.72l3.25-2.5Z"*/}
            {/*    />*/}
            {/*    <path*/}
            {/*        fill="#EA4335"*/}
            {/*        d="M12 5.85c1.43 0 2.72.49 3.74 1.45l2.8-2.8C16.83 2.96 14.62 2.5 12 2.5a9.74 9.74 0 0 0-8.74 5l3.25 2.5C7.29 7.57 9.45 5.85 12 5.85Z"*/}
            {/*    />*/}
            {/*  </svg>*/}

            {/*  Continue with Google*/}
            {/*</button>*/}

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: "#ddd5c8" }} />
              <span
                  className="text-xs uppercase tracking-wider"
                  style={{ color: "#a2968b" }}
              >
              or
            </span>
              <div className="flex-1 h-px" style={{ background: "#ddd5c8" }} />
            </div>

            <form onSubmit={submit} className="grid gap-4">

              {/* Email */}
              <div>
                <label
                    className="block text-xs font-semibold mb-2"
                    style={{ color: "#4a3f35" }}
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "#a2968b" }}
                  />

                  <input
                      required
                      placeholder="Username"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 rounded-xl text-sm outline-none"
                      style={{
                        background: "#f2ede6",
                        border: "1px solid #ddd5c8",
                        color: "#1c1714",
                      }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                    className="block text-xs font-semibold mb-2"
                    style={{ color: "#4a3f35" }}
                >
                  Password
                </label>

                <div className="relative">
                  <Lock
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "#a2968b" }}
                  />

                  <input
                      type="password"
                      required
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: "#f2ede6",
                        border: "1px solid #ddd5c8",
                        color: "#1c1714",
                      }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-display font-bold text-sm mt-2 transition-all hover:-translate-y-0.5 disabled:opacity-60"
                  style={{
                    background: "#d95a2b",
                    color: "#ffffff",
                    boxShadow: "0 10px 25px rgba(217, 90, 43, 0.18)",
                  }}
              >
                {loading ? "Logging in…" : "Log in"}

                {!loading && <ArrowUpRight size={16} />}
              </button>
            </form>

            <div
                className="mt-7 pt-6 text-center"
                style={{ borderTop: "1px solid #ddd5c8" }}
            >
              <p className="text-sm" style={{ color: "#8a7d72" }}>
                New to Ascend?{" "}
                <Link
                    to="/register"
                    className="font-semibold hover:underline"
                    style={{ color: "#d95a2b" }}
                >
                  Create your account
                </Link>
              </p>
            </div>
          </div>

          {/* Back to homepage */}
          <div className="text-center mt-5">
            <Link
                to="/"
                className="text-xs transition-colors hover:underline"
                style={{ color: "#8a7d72" }}
            >
              ← Back to Ascend
            </Link>
          </div>
        </div>
      </div>
  );
}