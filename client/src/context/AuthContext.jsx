import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { API_URL, getErrorMessage } from "../config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem("shopsphere_access_token"),
  );
  const [authLoading, setAuthLoading] = useState(true);

  const saveSession = useCallback((data) => {
    const token = data?.accessToken;
    if (token) {
      localStorage.setItem("shopsphere_access_token", token);
      setAccessToken(token);
    }
    setUser(data?.user || null);
    return data?.user || null;
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("shopsphere_access_token");
    setAccessToken(null);
    setUser(null);
  }, []);

  // Retry expired Bearer-token requests once after rotating the HttpOnly refresh cookie.
  useEffect(() => {
    let refreshPromise = null;
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config;
        const url = original?.url || "";
        const isAuthEndpoint =
          /\/auth\/(login|register|verify-email|forgot-password|reset-password|refresh|logout)/.test(
            url,
          );
        if (
          error.response?.status !== 401 ||
          !original ||
          original._shopsphereRetried ||
          isAuthEndpoint
        ) {
          return Promise.reject(error);
        }
        original._shopsphereRetried = true;
        try {
          if (!refreshPromise) {
            refreshPromise = axios.post(
              `${API_URL}/auth/refresh`,
              {},
              { withCredentials: true },
            );
          }
          const response = await refreshPromise;
          refreshPromise = null;
          saveSession(response.data);
          original.headers = {
            ...original.headers,
            Authorization: `Bearer ${response.data.accessToken}`,
          };
          return axios(original);
        } catch (refreshError) {
          refreshPromise = null;
          clearSession();
          return Promise.reject(refreshError);
        }
      },
    );
    return () => axios.interceptors.response.eject(interceptorId);
  }, [clearSession, saveSession]);

  // Restore a session from the short-lived access token, or rotate the HttpOnly refresh cookie.
  useEffect(() => {
    let active = true;
    const restore = async () => {
      const stored = localStorage.getItem("shopsphere_access_token");
      if (stored) {
        try {
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${stored}` },
            withCredentials: true,
          });
          if (active) {
            setAccessToken(stored);
            setUser(response.data.user);
          }
          return;
        } catch {
          /* Access token may have expired; try the refresh cookie below. */
        }
      }
      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        if (active) saveSession(response.data);
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setAuthLoading(false);
      }
    };
    restore().finally(() => {
      if (active) setAuthLoading(false);
    });
    return () => {
      active = false;
    };
  }, [clearSession, saveSession]);

  const login = useCallback(async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials, {
        withCredentials: true,
      });
      return saveSession(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to sign in."));
    }
  }, [saveSession]);

  const register = useCallback(async (details) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, details, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to create account."));
    }
  }, []);

  const verifyEmail = useCallback(async (token, password) => {
    try {
      const body = { token };
      if (password) body.password = password;
      const response = await axios.post(`${API_URL}/auth/verify-email`, body);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to verify your email."));
    }
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Unable to request a password reset."),
      );
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to reset your password."));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );
    } catch {
      /* Clear local state even if the remote session has already expired. */
    }
    clearSession();
  }, [accessToken, clearSession]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      authLoading,
      login,
      register,
      verifyEmail,
      requestPasswordReset,
      resetPassword,
      logout,
      clearSession,
    }),
    [
      user,
      accessToken,
      authLoading,
      login,
      register,
      verifyEmail,
      requestPasswordReset,
      resetPassword,
      logout,
      clearSession,
    ],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
};
