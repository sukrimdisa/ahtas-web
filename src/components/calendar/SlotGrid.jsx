import "./calendar.css";

/**
 * SlotGrid — Premium dark theme
 *
 * Props:
 *   grid        {Array}  – [{ key, label, startDt, status }]
 *                          status: "AVAILABLE" | "UNAVAILABLE"
 *   selectedKey {string} – key of the currently selected slot
 *   onSelect    {func}   – called with the full grid-item on click
 *   loading     {bool}   – show loading state
 */
export default function SlotGrid({ grid = [], selectedKey = "", onSelect, loading = false }) {
  if (loading) {
    return (
      <div className="slotLoading">
        <span className="spinner" />
        Loading slots…
      </div>
    );
  }

  if (grid.length === 0) {
    return (
      <div className="slotEmpty">
        No time slots available — select a service, therapist and date above.
      </div>
    );
  }

  return (
    <div className="slotGrid">
      {grid.map((g) => {
        const isSelected  = selectedKey === g.key;
        const isAvailable = g.status === "AVAILABLE";

        const cls = isSelected
          ? "slot slotSel"
          : isAvailable
          ? "slot slotAvail"
          : "slot slotUnavail";

        return (
          <button
            key={g.key}
            className={cls}
            disabled={!isAvailable}
            onClick={() => isAvailable && onSelect?.(g)}
            title={isAvailable ? "Available — click to select" : "Unavailable"}
            aria-pressed={isSelected}
            aria-label={`${g.label} – ${isSelected ? "selected" : isAvailable ? "available" : "unavailable"}`}
          >
            <div className="slotTime">{g.label}</div>
          </button>
        );
      })}
    </div>
  );
}
