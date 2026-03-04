import axios from "axios";

// Public tunnel URL (localtunnel) — update this if tunnel restarts
const API_BASE = import.meta.env.VITE_API_URL || "https://cruel-pots-do.loca.lt";

export const api = axios.create({
  baseURL: API_BASE
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Required by localtunnel to bypass the warning page for API calls
  config.headers["bypass-tunnel-reminder"] = "true";
  return config;
});
