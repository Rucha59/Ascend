import React from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import HomeDashboard from "./pages/HomeDashboard";
import LoginView from "./pages/LoginView";
import { Loader2 } from "lucide-react";

function RootContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex flex-col items-center justify-center text-primary">
        <Loader2 size={32} className="animate-spin" />
        <p className="text-[12px] font-semibold text-text-muted mt-3">
          Loading Ascend...
        </p>
      </div>
    );
  }

  return isAuthenticated ? <HomeDashboard /> : <LoginView />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
