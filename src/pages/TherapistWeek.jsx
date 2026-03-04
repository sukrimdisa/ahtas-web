import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import "../components/ui/ui.css";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
function mondayOf(dateStr) {
  const d   = new Date(dateStr + "T00:00:00.000Z");
  const day = d.getUTCDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusColor(status) {
  if (status === "CONFIRMED" || status === "COMPLETED") return "rgba(34,197,94,.18)";
  if (status === "NO_SHOW")   return "rgba(239,68,68,.18)";
  if (status === "BOOKED")    return "rgba(59,130,246,.14)";
  return "rgba(245,158,11,.14)";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function TherapistWeek() {
  const [me,          setMe]          = useState(null);
  const [anchorDate,  setAnchorDate]  = useState("");
  const [weekStart,   setWeekStart]   = useState("");
  const [days,        setDays]        = useState({});
  const [loading,     setLoading]     = useState(false);

  // Load current user
  useEffect(() => {
    api.get("/auth/me")
      .then(({ data }) => {
        setMe(data);
        const today = new Date().toISOString().slice(0, 10);
        setAnchorDate(today);
      })
      .catch(() => {});
  }, []);

  // Derive weekStart from anchorDate
  useEffect(() => {
    if (!anchorDate) return;
    setWeekStart(mondayOf(anchorDate));
  }, [anchorDate]);

  // Fetch week data
  const refresh = async () => {
    if (!me?.id || !weekStart) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/therapists/${me.id}/schedule-week?weekStart=${weekStart}`);
      setDays(data.days || {});
    } catch {
      setDays({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!me?.id || !weekStart) return;
    refresh();
    const t = setInterval(refresh, 15_000);
    return () => clearInterval(t);
  }, [me?.id, weekStart]);

  // Build day labels Mon–Sun
  const labels = useMemo(() => {
    if (!weekStart) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      return {
        date:  d,
        label: new Date(d + "T00:00:00.000Z").toLocaleDateString([], {
          weekday: "short", day: "2-digit", month: "short"
        })
      };
    });
  }, [weekStart]);

  const prevWeek = () => setAnchorDate(addDays(weekStart, -7));
  const nextWeek = () => setAnchorDate(addDays(weekStart,  7));

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="container">
      <div className="card">
        <div className="cardTitle">
          <CalendarDays size={18} /> Therapist Week View
        </div>
        <div className="muted small">Mon–Sun &nbsp;·&nbsp; 🔄 Real-time refresh every 15s</div>

        {/* ── Week navigation ── */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
          <button className="btn" onClick={prevWeek}>
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="badge blue">Week: {weekStart}</span>
          <button className="btn" onClick={nextWeek}>
            Next <ChevronRight size={16} />
          </button>
          {loading && <span className="spinner" />}
        </div>

        {/* ── 7-column grid ── */}
        <div style={{
          display:               "grid",
          gridTemplateColumns:   "repeat(7, minmax(0, 1fr))",
          gap:                   10,
          marginTop:             16,
          overflowX:             "auto"
        }}>
          {labels.map(({ date, label }) => {
            const list    = days?.[date] || [];
            const isToday = date === today;

            return (
              <div
                key={date}
                className="card"
                style={{
                  padding:    12,
                  boxShadow:  "none",
                  background: isToday
                    ? "rgba(59,130,246,.10)"
                    : "rgba(255,255,255,.04)",
                  borderColor: isToday
                    ? "rgba(59,130,246,.35)"
                    : "rgba(255,255,255,.10)",
                  minWidth:   110
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 12 }}>{label}</div>
                <div className="muted small" style={{ marginBottom: 8 }}>
                  {list.length} booking{list.length !== 1 ? "s" : ""}
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  {list.length === 0 ? (
                    <div className="muted small" style={{ opacity: .5 }}>—</div>
                  ) : (
                    list.map(it => (
                      <div
                        key={it.id}
                        style={{
                          border:       "1px solid rgba(255,255,255,.12)",
                          borderRadius: 10,
                          padding:      "7px 8px",
                          background:   statusColor(it.status)
                        }}
                      >
                        <div style={{ fontWeight: 900, fontSize: 11 }}>
                          {fmtTime(it.startDt)} – {fmtTime(it.endDt)}
                        </div>
                        <div className="muted small" style={{ fontSize: 10, marginTop: 2 }}>
                          {it.title}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {me?.role !== "THERAPIST" && (
          <div style={{ marginTop: 14 }} className="badge warn">
            ⚠️ Log in as a THERAPIST account to see your week view.
          </div>
        )}
      </div>
    </div>
  );
}
