import { Route, Routes, useLocation } from "react-router-dom";
import { useStytchMemberSession } from "@stytch/react/b2b";
import "./App.css";
import Settings from "./components/Settings";
import Profile from "./components/Profile";
import { Dashboard } from "./components/Dashboard";
import { SideNav } from "./components/SideNav";
import { LoginOrSignup } from "./components/LoginOrSignup";
import { Authenticate } from "./components/Authenticate";
import { ProtectedRoutes } from "./components/ProtectedRoutes";

export const App = () => {
  const location = useLocation();
  const { session } = useStytchMemberSession();
  const showSidebar =
    session &&
    ["/dashboard", "/settings", "/profile"].includes(location.pathname);

  return (
    <div className="app-container">
      {showSidebar && <SideNav />}
      <div className="centered-container">
        <Routes>
          <Route path="/" element={<LoginOrSignup />} />
          <Route path="/authenticate" element={<Authenticate />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};
