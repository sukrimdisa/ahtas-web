import axios from "axios";

// VITE_API_URL is set at build time via Vercel env vars
// Fallback to localhost for local development
const API_BASE = import.meta.env.VITE_API_URL || "https://ahtas-api-production.up.railway.app";

export const api = axios.create({
  baseURL: API_BASE
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
