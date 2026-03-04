import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "../api/client";
import "../components/ui/ui.css";
import SlotGrid from "../components/calendar/SlotGrid";
import { CalendarCheck, Stethoscope, Wrench } from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function minutesToISO(dateStr, minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const d = new Date(dateStr + "T00:00:00.000Z");
  d.setUTCHours(h, m, 0, 0);
  return d.toISOString();
}
function minutesLabel(minutes) {
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

const STEP    = 30;
const POLL_MS = 15_000;

// ── Component ─────────────────────────────────────────────────────────────────
export default function BookingCalendar() {
  const [services,   setServices]   = useState([]);
  const [therapists, setTherapists] = useState([]);

  const [serviceId,   setServiceId]   = useState("");
  const [therapistId, setTherapistId] = useState("");
  const [date,        setDate]        = useState("");

  const [grid,             setGrid]             = useState([]);
  const [selectedKey,      setSelectedKey]      = useState("");
  const [selectedStartDt,  setSelectedStartDt]  = useState("");
  const [loading,          setLoading]          = useState(false);
  const [booking,          setBooking]          = useState(false);
  const [msg,              setMsg]              = useState("");

  // Keep latest selectedStartDt accessible inside stale interval closure
  const selectedRef = useRef("");
  useEffect(() => { selectedRef.current = selectedStartDt; }, [selectedStartDt]);

  // ── Load services on mount ────────────────────────────────────────────────
  useEffect(() => {
    api.get("/services").then(({ data }) => setServices(data)).catch(() => {});
  }, []);

  // ── Load therapists when service changes ──────────────────────────────────
  useEffect(() => {
    setTherapistId("");
    setGrid([]);
    setSelectedKey("");
    setSelectedStartDt("");
    if (!serviceId) return;
    api.get(`/therapists?serviceId=${serviceId}`)
      .then(({ data }) => setTherapists(data))
      .catch(() => {});
  }, [serviceId]);

  // ── Refresh grid ──────────────────────────────────────────────────────────
  const refreshGrid = useCallback(async () => {
    if (!serviceId || !therapistId || !date) return;

    try {
      const [winRes, slotRes] = await Promise.all([
        api.get(`/availability/window?date=${date}&therapistId=${therapistId}`),
        api.get(`/availability/slots?date=${date}&therapistId=${therapistId}&serviceId=${serviceId}`)
      ]);

      const windows        = winRes.data.windows  || [];
      const availableSlots = slotRes.data          || [];
      const availableSet   = new Set(availableSlots.map(s => s.startDt));

      const cells = [];
      for (const w of windows) {
        const startM = timeToMinutes(w.startTime);
        const endM   = timeToMinutes(w.endTime);
        for (let t = startM; t < endM; t += STEP) {
          const startIso = minutesToISO(date, t);
          cells.push({
            key:     startIso,
            label:   minutesLabel(t),
            startDt: startIso,
            status:  availableSet.has(startIso) ? "AVAILABLE" : "UNAVAILABLE"
          });
        }
      }

      setGrid(cells);

      // Clear selection if it became unavailable
      if (selectedRef.current && !availableSet.has(selectedRef.current)) {
        setSelectedKey("");
        setSelectedStartDt("");
      }
    } catch (err) {
      console.error("[BookingCalendar] refreshGrid:", err);
    }
  }, [serviceId, therapistId, date]);

  // ── Poll effect ───────────────────────────────────────────────────────────
  useEffect(() => {
    setGrid([]);
    setSelectedKey("");
    setSelectedStartDt("");
    setMsg("");
    if (!serviceId || !therapistId || !date) return;

    setLoading(true);
    refreshGrid().finally(() => setLoading(false));

    const timer = setInterval(refreshGrid, POLL_MS);
    return () => clearInterval(timer);
  }, [serviceId, therapistId, date, refreshGrid]);

  // ── Book ──────────────────────────────────────────────────────────────────
  const book = async () => {
    if (!selectedStartDt) return;
    setMsg("");
    setBooking(true);
    try {
      const { data } = await api.post("/appointments", {
        serviceId,
        therapistId,
        startDt: selectedStartDt
      });
      setMsg(`✅ Booking confirmed! Room: ${data.allocatedRoomId}`);
      setSelectedKey("");
      setSelectedStartDt("");
      await refreshGrid();
    } catch (e) {
      const errData = e?.response?.data;
      if (errData?.suggestedSlots?.length) {
        setMsg(`❌ ${errData.message}. Try another green slot.`);
        await refreshGrid();
      } else {
        setMsg(errData?.message || "Booking failed. Please try again.");
      }
    } finally {
      setBooking(false);
    }
  };

  const msgClass = msg.startsWith("✅") ? "badge good" : msg ? "badge bad" : "";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container">
      <div className="card">
        <div className="cardTitle">
          <CalendarCheck size={18} /> AHTAS Booking Calendar
        </div>
        <div className="muted small">
          🟢 Green = available &nbsp;·&nbsp; ⬜ Grey = unavailable &nbsp;·&nbsp; 🔄 Auto-refresh every 15s
        </div>

        {/* ── Filters ── */}
        <div className="grid3" style={{ marginTop: 14 }}>
          <div>
            <label className="muted small" style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
              <Wrench size={13} /> Service
            </label>
            <select value={serviceId} onChange={e => setServiceId(e.target.value)}>
              <option value="">— select service —</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMin}m + {s.bufferMin}m buffer)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="muted small" style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
              <Stethoscope size={13} /> Therapist
            </label>
            <select value={therapistId} onChange={e => setTherapistId(e.target.value)} disabled={!serviceId}>
              <option value="">— select therapist —</option>
              {therapists.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="muted small" style={{ display: "block", marginBottom: 6 }}>Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              disabled={!therapistId}
            />
          </div>
        </div>

        {/* ── Slot grid ── */}
        <div style={{ marginTop: 18 }}>
          <SlotGrid
            grid={grid}
            selectedKey={selectedKey}
            loading={loading}
            onSelect={(g) => {
              setSelectedKey(g.key);
              setSelectedStartDt(g.startDt);
              setMsg("");
            }}
          />
        </div>

        {/* ── Booking action ── */}
        <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn" onClick={book} disabled={!selectedStartDt || booking}>
            {booking
              ? <><span className="spinner" /> Booking…</>
              : <>▶ Confirm Booking</>
            }
          </button>
          {selectedStartDt && !booking && (
            <span className="badge blue">
              Selected: {new Date(selectedStartDt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
            </span>
          )}
        </div>

        {/* ── Status message ── */}
        {msg && (
          <div style={{ marginTop: 12 }} className={msgClass}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
