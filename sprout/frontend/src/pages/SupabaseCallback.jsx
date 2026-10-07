import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function SupabaseCallback() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [error, setError] = useState("");

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { data, error: sessionError } =
                    await supabase.auth.getSession();

                if (sessionError) {
                    throw sessionError;
                }

                const session = data.session;

                if (!session) {
                    throw new Error("No Supabase session found.");
                }

                // Temporarily store the Supabase access token.
                localStorage.setItem(
                    "sprout_token",
                    session.access_token
                );

                // Ask Spring Boot to find/create the Sprout user.
                const response = await api.post("/auth/register-oauth", {
                    email: session.user.email,
                    name:
                        session.user.user_metadata?.full_name ||
                        session.user.user_metadata?.name ||
                        "",
                    username:
                        session.user.user_metadata?.user_name ||
                        session.user.email?.split("@")[0] ||
                        "",
                });

                const userData = response.data.user;

                localStorage.setItem(
                    "sprout_user",
                    JSON.stringify(userData)
                );

                setUser(userData);

                navigate("/", { replace: true });
            } catch (err) {
                console.error("Supabase Google login failed:", err);
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Google sign-in failed."
                );
            }
        };

        handleCallback();
    }, [navigate, setUser]);

    if (error) {
        return (
            <div>
                <h2>Google sign-in failed</h2>
                <p>{error}</p>
            </div>
        );
    }

    return <div>Signing you in...</div>;
}