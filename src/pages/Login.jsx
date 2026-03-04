import { useState } from "react";
import { api } from "../api/client";
import "../components/ui/ui.css";
import { LogIn } from "lucide-react";

export default function Login({ onLoggedIn }) {
  const [email,    setEmail]    = useState("customer@ahtas.com");
  const [password, setPassword] = useState("customer123");
  const [err,      setErr]      = useState("");
  const [loading,  setLoading]  = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      onLoggedIn?.();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520, paddingTop: 60 }}>
      <div className="card">
        <div className="cardTitle">
          <LogIn size={18} /> AHTAS Login
        </div>
        <div className="muted small" style={{ marginBottom: 4 }}>
          Use seed accounts below to test the demo.
        </div>

        <form onSubmit={submit} style={{ marginTop: 14, display: "grid", gap: 10 }}>
          <div>
            <label className="muted small">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="muted small">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <><span className="spinner" /> Logging in…</> : <><LogIn size={15} /> Login</>}
          </button>
        </form>

        {err && (
          <div style={{ marginTop: 12 }} className="badge bad">
            {err}
          </div>
        )}

        <div style={{ marginTop: 18, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>🔑 Seed accounts</div>
          <div className="muted small" style={{ display: "grid", gap: 4 }}>
            <div
              style={{ cursor: "pointer", padding: "4px 0" }}
              onClick={() => { setEmail("customer@ahtas.com"); setPassword("customer123"); }}
            >
              👤 customer@ahtas.com / customer123
            </div>
            <div
              style={{ cursor: "pointer", padding: "4px 0" }}
              onClick={() => { setEmail("therapist@ahtas.com"); setPassword("therapist123"); }}
            >
              🩺 therapist@ahtas.com / therapist123
            </div>
            <div
              style={{ cursor: "pointer", padding: "4px 0" }}
              onClick={() => { setEmail("admin@ahtas.com"); setPassword("admin123"); }}
            >
              🛡️ admin@ahtas.com / admin123
            </div>
          </div>
          <div className="muted small" style={{ marginTop: 6, opacity: .6 }}>
            Click any row to auto-fill credentials.
          </div>
        </div>
      </div>
    </div>
  );
}
