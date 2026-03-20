const API = "http://localhost:4000/api";

export async function api(endpoint, options = {}) {
  const res = await fetch(`${API}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export const auth = {
  login: (data) => api("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data) => api("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  me: (token) => api("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
};

export const services = {
  list: () => api("/services"),
  book: (data) => api("/book", { method: "POST", body: JSON.stringify(data) })
};

export const therapists = {
  list: () => api("/therapists"),
  get: (id) => api(`/therapists/${id}`),
  income: (id) => api(`/therapists/${id}/income`)
};

export const appointments = {
  list: () => api("/appointments"),
  get: (ref) => api(`/appointments/${ref}`)
};

export const admin = {
  dashboard: (token) => api("/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
  analytics: (token) => api("/admin/analytics", { headers: { Authorization: `Bearer ${token}` } })
};
