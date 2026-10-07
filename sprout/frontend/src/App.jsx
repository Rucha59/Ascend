import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/OAuth2Callback.jsx";
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import Todos from "./pages/Todos";
import Projects from "./pages/Projects";
import Journal from "./pages/Journal";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import SupabaseCallback from "./pages/SupabaseCallback.jsx";
import HomeRoute from "./components/HomeRoute";
import Privacy from "./pages/Privacy";

export default function App() {
  return (
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public landing page */}
              <Route path="/" element={<HomeRoute />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route
                  path="/auth/supabase-callback"
                  element={<SupabaseCallback />}
              />
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/habits" element={<Habits />} />
                  <Route path="/todos" element={<Todos />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>
              {/* Unknown URL */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
  );
}