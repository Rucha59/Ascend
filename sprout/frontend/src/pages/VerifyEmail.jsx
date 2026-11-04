
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const email = searchParams.get("email") || "";

    const { verifySignupOtp, resendSignupOtp } = useAuth();

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const verify = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (otp.length !== 6) {
            setError("Please enter the 6-digit verification code.");
            return;
        }

        setLoading(true);

        try {
            await verifySignupOtp(email, otp);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(
                err.message || "Invalid or expired verification code."
            );
        } finally {
            setLoading(false);
        }
    };

    const resend = async () => {
        setError("");
        setMessage("");
        setResending(true);

        try {
            await resendSignupOtp(email);
            setMessage("A new verification code has been sent.");
        } catch (err) {
            setError(err.message || "Couldn't resend verification code.");
        } finally {
            setResending(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p>Missing email address.</p>
                    <Link to="/register">Back to registration</Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-6 py-12"
            style={{ background: "#f2ede6" }}
        >
            <div
                className="w-full max-w-md rounded-[28px] p-8"
                style={{
                    background: "#faf7f2",
                    border: "1px solid #ddd5c8",
                    boxShadow: "0 20px 60px rgba(28, 23, 20, 0.08)",
                }}
            >
                <p
                    className="text-xs font-semibold tracking-widest uppercase mb-3"
                    style={{ color: "#d95a2b" }}
                >
                    Email verification
                </p>

                <h1
                    className="font-display font-black text-3xl"
                    style={{ color: "#1c1714" }}
                >
                    Check your inbox.
                </h1>

                <p
                    className="text-sm mt-3 leading-relaxed"
                    style={{ color: "#8a7d72" }}
                >
                    We've sent a verification code to:
                    <br />
                    <strong>{email}</strong>
                </p>

                {error && (
                    <div className="mt-5 p-3 rounded-xl text-sm"
                         style={{ background: "#ff88aa22", color: "#b83c67" }}>
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mt-5 p-3 rounded-xl text-sm"
                         style={{ background: "#dcfce7", color: "#166534" }}>
                        {message}
                    </div>
                )}

                <form onSubmit={verify} className="mt-7 grid gap-4">
                    <label
                        className="text-xs font-semibold"
                        style={{ color: "#4a3f35" }}
                    >
                        6-digit verification code
                    </label>

                    <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        required
                        value={otp}
                        onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder="000000"
                        className="w-full px-4 py-4 rounded-xl text-center text-2xl tracking-[0.5em] outline-none"
                        style={{
                            background: "#f2ede6",
                            border: "1px solid #ddd5c8",
                            color: "#1c1714",
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="w-full py-3.5 rounded-xl font-display font-bold text-sm disabled:opacity-60"
                        style={{ background: "#d95a2b", color: "white" }}
                    >
                        {loading ? "Verifying..." : "Verify email"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm" style={{ color: "#8a7d72" }}>
                        Didn't receive the code?
                    </p>

                    <button
                        type="button"
                        onClick={resend}
                        disabled={resending}
                        className="mt-2 text-sm font-semibold disabled:opacity-60"
                        style={{ color: "#d95a2b" }}
                    >
                        {resending ? "Sending..." : "Resend code"}
                    </button>
                </div>
            </div>
        </div>
    );
}
