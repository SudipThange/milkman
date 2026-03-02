import { useMemo, useState } from "react";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";

const TOKEN_KEY = "punemilkman_admin_token";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [adminInfo, setAdminInfo] = useState(() => {
    const raw = localStorage.getItem("punemilkman_admin_info");
    return raw ? JSON.parse(raw) : null;
  });

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  const handleLogin = ({ token: newToken, userId, email }) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem("punemilkman_admin_info", JSON.stringify({ userId, email }));
    setToken(newToken);
    setAdminInfo({ userId, email });
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("punemilkman_admin_info");
    setToken("");
    setAdminInfo(null);
  };

  return isAuthenticated ? (
    <Dashboard token={token} adminInfo={adminInfo} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}
