import { v4 as uuid } from "uuid";

export function generateBookingRef() {
  return "AHTAS-" + uuid().slice(0, 8).toUpperCase();
}

export function calculateEndTime(startDt, durationMinutes) {
  const endDt = new Date(startDt);
  endDt.setMinutes(endDt.getMinutes() + durationMinutes);
  return endDt;
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString('ms-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function checkTimeSlotAvailable(existingAppointments, newStart, newEnd) {
  for (const appointment of existingAppointments) {
    const existingStart = new Date(appointment.startDt);
    const existingEnd = new Date(appointment.endDt);

    // Check for overlap
    if (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    ) {
      return false;
    }
  }
  return true;
}
