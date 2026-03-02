import { useEffect, useState } from "react";
import { clearToken, getAuthEventName, getToken, setToken } from "../services/auth";

export default function useAuth() {
  const [token, setLocalToken] = useState(() => getToken() || "");

  useEffect(() => {
    const sync = () => setLocalToken(getToken() || "");
    const authEvent = getAuthEventName();

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(authEvent, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(authEvent, sync);
    };
  }, []);

  const login = (newToken) => {
    setToken(newToken);
    setLocalToken(newToken);
  };

  const logout = () => {
    clearToken();
    setLocalToken("");
  };

  return {
    isLoggedIn: Boolean(token),
    token,
    login,
    logout,
  };
}
