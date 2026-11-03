import { createContext, useContext, useEffect, useState } from "react";
import { http, setAccessToken } from "../api/http";
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    http
      .post("/auth/refresh")
      .then((r) => {
        setAccessToken(r.data.accessToken);
        setUser(r.data.user);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  const login = async (credentials) => {
    const { data } = await http.post("/auth/login", credentials);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };
  const register = async (payload) => {
    const { data } = await http.post("/auth/register", payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };
  const logout = async () => {
    try {
      await http.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };
  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
