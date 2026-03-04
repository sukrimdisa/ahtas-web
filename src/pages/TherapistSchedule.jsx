import { useEffect, useState } from "react";
import { api } from "../api/client";
import "../components/ui/ui.css";
import { CalendarClock } from "lucide-react";

function timeOf(d) {
  return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusBadge(status) {
  if (status === "CONFIRMED") return "badge good";
  if (status === "COMPLETED") return "badge good";
  if (status === "NO_SHOW")   return "badge bad";
  if (status === "BOOKED")    return "badge blue";
  return "badge warn";
}

export default function TherapistSchedule() {
  const [me,    setMe]    = useState(null);
  const [date,  setDate]  = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/auth/me")
      .then(({ data }) => {
        setMe(data);
        setDate(new Date().toISOString().slice(0, 10));
      })
      .catch(() => {});
  }, []);

  const refresh = async () => {
    if (!me?.id || !date) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/therapists/${me.id}/schedule?date=${date}`);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!me?.id || !date) return;
    refresh();
    const t = setInterval(refresh, 15_000);
    return () => clearInterval(t);
  }, [me?.id, date]);

  return (
    <div className="container">
      <div className="card">
        <div className="cardTitle">
          <CalendarClock size={18} /> Therapist Day Schedule
        </div>
        <div className="muted small">🔄 Real-time refresh every 15s</div>

        <div style={{ marginTop: 14, maxWidth: 320 }}>
          <label className="muted small" style={{ display: "block", marginBottom: 6 }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
          {loading && items.length === 0 ? (
            <div className="muted small" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="spinner" /> Loading schedule…
            </div>
          ) : items.length === 0 ? (
            <div className="badge warn">No appointments or blocked time for this date.</div>
          ) : (
            items.map((it, idx) => (
              <div
                key={idx}
                className="card"
                style={{ padding: 12, boxShadow: "none", background: "rgba(255,255,255,.05)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>
                    {timeOf(it.startDt)} – {timeOf(it.endDt)}
                  </div>
                  {it.type === "BOOKED"
                    ? <span className={statusBadge(it.status)}>{it.status}</span>
                    : <span className="badge warn">{it.type}</span>
                  }
                </div>
                <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                  {it.title || it.type}
                </div>
              </div>
            ))
          )}
        </div>

        {me?.role !== "THERAPIST" && (
          <div style={{ marginTop: 14 }} className="badge warn">
            ⚠️ Log in as a THERAPIST account to see your schedule.
          </div>
        )}
      </div>
    </div>
  );
}
