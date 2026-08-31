// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import { ThemeProvider } from "./context/ThemeContext";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Layout from "./components/Layout";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import Habits from "./pages/Habits";
// import Todos from "./pages/Todos";
// import Projects from "./pages/Projects";
// import Journal from "./pages/Journal";
// import Analytics from "./pages/Analytics";
// import Profile from "./pages/Profile";
// import OAuth2Callback from "./pages/OAuth2Callback";
//
// export default function App() {
//   return (
//       <ThemeProvider>
//         <AuthProvider>
//           <BrowserRouter>
//             <Routes>
//               <Route path="/login" element={<Login />} />
//               <Route path="/oauth2/callback" element={<OAuth2Callback />} />
//               <Route path="/register" element={<Register />} />
//               <Route element={<ProtectedRoute />}>
//                 <Route element={<Layout />}>
//                   <Route path="/" element={<Dashboard />} />
//                   <Route path="/habits" element={<Habits />} />
//                   <Route path="/todos"    element={<Todos />} />
//                   <Route path="/projects" element={<Projects />} />
//                   <Route path="/journal"   element={<Journal />} />
//                   <Route path="/analytics" element={<Analytics />} />
//                   <Route path="/profile"   element={<Profile />} />
//                 </Route>
//               </Route>
//             </Routes>
//           </BrowserRouter>
//         </AuthProvider>
//       </ThemeProvider>
//   );
// }
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeRoute from "./components/HomeRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import Todos from "./pages/Todos";
import Projects from "./pages/Projects";
import Journal from "./pages/Journal";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import OAuth2Callback from "./pages/OAuth2Callback";

export default function App() {
  return (
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>

              {/* Public landing page */}
              <Route path="/" element={<HomeRoute />} />

              {/* Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/oauth2/callback" element={<OAuth2Callback />} />

              {/* Protected application */}
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