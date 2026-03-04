import { useEffect, useState } from "react";
import { api } from "../api/client";
import "../components/ui/ui.css";
import { BarChart3, CalendarRange, TrendingUp, TriangleAlert } from "lucide-react";

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function pct(x) {
  return `${Math.round((x || 0) * 100)}%`;
}

export default function AdminDashboard() {
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd,   setRangeEnd]   = useState("");
  const [data,       setData]       = useState(null);
  const [msg,        setMsg]        = useState("");
  const [loading,    setLoading]    = useState(false);

  // Default range: last 7 days → tomorrow
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setRangeStart(addDays(today, -7));
    setRangeEnd(addDays(today, 1));
  }, []);

  const load = async () => {
    if (!rangeStart || !rangeEnd) return;
    setMsg("");
    setLoading(true);
    try {
      const res = await api.get(`/admin/metrics?start=${rangeStart}&end=${rangeEnd}`);
      setData(res.data);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load metrics — make sure you are logged in as ADMIN.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rangeStart || !rangeEnd) return;
    load();
  }, [rangeStart, rangeEnd]);

  return (
    <div className="container">
      <div className="card">
        <div className="cardTitle">
          <BarChart3 size={18} /> Admin Dashboard
        </div>
        <div className="muted small">Total bookings · No-show rate · Utilisation</div>

        {/* ── Date range picker ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px", gap: 12, marginTop: 14 }}>
          <div>
            <label className="muted small" style={{ display: "block", marginBottom: 6 }}>Start (inclusive)</label>
            <input type="date" value={rangeStart} onChange={e => setRangeStart(e.target.value)} />
          </div>
          <div>
            <label className="muted small" style={{ display: "block", marginBottom: 6 }}>End (exclusive)</label>
            <input type="date" value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="btn" onClick={load} disabled={loading} style={{ width: "100%" }}>
              {loading
                ? <><span className="spinner" /> Loading…</>
                : <><CalendarRange size={15} /> Refresh</>
              }
            </button>
          </div>
        </div>

        {/* ── Error message ── */}
        {msg && (
          <div style={{ marginTop: 12 }} className="badge bad">
            <TriangleAlert size={14} /> {msg}
          </div>
        )}

        {/* ── Metric cards ── */}
        {data && (
          <>
            <div className="grid3" style={{ marginTop: 16 }}>
              {/* Total bookings */}
              <div className="card" style={{ boxShadow: "none" }}>
                <div className="cardTitle" style={{ fontSize: 13 }}>
                  <TrendingUp size={16} /> Total Bookings
                </div>
                <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.1 }}>
                  {data.totalBookings}
                </div>
                <div className="muted small" style={{ marginTop: 4 }}>
                  {data.start} → {data.end}
                </div>
              </div>

              {/* No-show rate */}
              <div className="card" style={{ boxShadow: "none" }}>
                <div className="cardTitle" style={{ fontSize: 13 }}>
                  <TriangleAlert size={16} /> No-show Rate
                </div>
                <div style={{
                  fontSize:   38,
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color:      data.noShowRate > 0.2 ? "#ef4444" : data.noShowRate > 0.1 ? "#f59e0b" : "#22c55e"
                }}>
                  {pct(data.noShowRate)}
                </div>
                <div className="muted small" style={{ marginTop: 4 }}>
                  {data.noShowCount} no-show(s) of {data.totalBookings}
                </div>
              </div>

              {/* Utilisation */}
              <div className="card" style={{ boxShadow: "none" }}>
                <div className="cardTitle" style={{ fontSize: 13 }}>
                  <BarChart3 size={16} /> Utilisation
                </div>
                <div style={{
                  fontSize:   38,
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color:      data.utilisation > 0.7 ? "#22c55e" : data.utilisation > 0.4 ? "#f59e0b" : "#ef4444"
                }}>
                  {pct(data.utilisation)}
                </div>
                <div className="muted small" style={{ marginTop: 4 }}>
                  {Math.round(data.bookedMinutes)} min booked / {Math.round(data.availableMinutes)} min available
                </div>
              </div>
            </div>

            {/* ── Progress bar ── */}
            <div style={{ marginTop: 16 }}>
              <div className="muted small" style={{ marginBottom: 6 }}>Utilisation bar</div>
              <div style={{
                height:       10,
                borderRadius: 999,
                background:   "rgba(255,255,255,.08)",
                overflow:     "hidden"
              }}>
                <div style={{
                  height:       "100%",
                  width:        `${Math.min(100, Math.round(data.utilisation * 100))}%`,
                  borderRadius: 999,
                  background:   data.utilisation > 0.7
                    ? "linear-gradient(90deg, #22c55e, #16a34a)"
                    : data.utilisation > 0.4
                    ? "linear-gradient(90deg, #f59e0b, #d97706)"
                    : "linear-gradient(90deg, #ef4444, #dc2626)",
                  transition:   "width .4s ease"
                }} />
              </div>
            </div>
          </>
        )}

        {!data && !msg && !loading && (
          <div style={{ marginTop: 14 }} className="badge warn">
            ⚠️ Log in as an ADMIN account to view metrics.
          </div>
        )}
      </div>
    </div>
  );
}
