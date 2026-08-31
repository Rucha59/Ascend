import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";

export default function HomeRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    return user ? <Navigate to="/dashboard" replace /> : <Home />;
}