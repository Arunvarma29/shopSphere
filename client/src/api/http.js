import axios from "axios";
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});
let accessToken = null;
let refreshing = null;
export const setAccessToken = (token) => {
  accessToken = token;
};
http.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});
http.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      !original?._retry &&
      !original?.url?.includes("/auth/")
    ) {
      original._retry = true;
      try {
        refreshing ||= http
          .post("/auth/refresh")
          .then((r) => {
            accessToken = r.data.accessToken;
            return accessToken;
          })
          .finally(() => {
            refreshing = null;
          });
        const token = await refreshing;
        original.headers.Authorization = `Bearer ${token}`;
        return http(original);
      } catch {
        accessToken = null;
      }
    }
    return Promise.reject(error);
  },
);
