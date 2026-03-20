import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "./api/client";

import "./components/ui/ui.css";

import Login             from "./pages/Login";
import BookingCalendar   from "./pages/BookingCalendar";
import TherapistSchedule from "./pages/TherapistSchedule";
import TherapistWeek     from "./pages/TherapistWeek";
import AdminDashboard    from "./pages/AdminDashboard";

import { LogOut, Stethoscope, CalendarClock, Shield, CalendarCheck } from "lucide-react";

// ── Layout wrapper with sticky nav ────────────────────────────────────────────
function Layout({ children }) {
  const [me, setMe] = useState(null);
  const nav = useNavigate();

  const loadMe = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      try {
        setMe(JSON.parse(user));
      } catch {
        setMe(null);
      }
    }
  };

  useEffect(() => { loadMe(); }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMe(null);
    nav("/login");
  };

  const roleIcon =
    me?.role === "THERAPIST" ? <Stethoscope size={13} /> :
    me?.role === "ADMIN"     ? <Shield size={13} />      :
                               <CalendarCheck size={13} />;

  return (
    <>
      {/* ── Top bar ── */}
      <div className="topbar">
        <div className="nav">
          <Link to="/" style={{ fontWeight: 900, fontSize: "1.1rem", letterSpacing: ".02em", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🌿 AHTAS PRO
          </Link>

          <Link to="/">Booking</Link>
          <Link to="/therapist">Day View</Link>
          <Link to="/therapist-week">Week View</Link>
          <Link to="/admin">Admin</Link>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {me ? (
              <>
                <span className="badge blue">
                  {roleIcon} {me.name || me.email} · {me.role}
                </span>
                <button className="btn" onClick={logout}>
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn">Login</Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Page content ── */}
      {children}
    </>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login onLoggedIn={() => (window.location.href = "/")} />}
        />
        <Route path="/" element={
          <Layout><BookingCalendar /></Layout>
        } />
        <Route path="/therapist" element={
          <Layout><TherapistSchedule /></Layout>
        } />
        <Route path="/therapist-week" element={
          <Layout><TherapistWeek /></Layout>
        } />
        <Route path="/admin" element={
          <Layout><AdminDashboard /></Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
