export function validateBooking(req, res, next) {
  const { therapistId, serviceId, startDt } = req.body;

  const errors = [];

  if (!therapistId) errors.push("therapistId is required");
  if (!serviceId) errors.push("serviceId is required");
  if (!startDt) errors.push("startDt is required");

  if (startDt) {
    const appointmentDate = new Date(startDt);
    const now = new Date();
    
    if (isNaN(appointmentDate.getTime())) {
      errors.push("Invalid date format");
    } else if (appointmentDate < now) {
      errors.push("Cannot book appointments in the past");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  next();
}

export function validateRegistration(req, res, next) {
  const { name, email, password } = req.body;

  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push("Valid email is required");
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  next();
}

export function validateAvailability(req, res, next) {
  const { date, startTime, endTime } = req.body;

  const errors = [];

  if (!date) errors.push("date is required");
  if (!startTime) errors.push("startTime is required");
  if (!endTime) errors.push("endTime is required");

  if (startTime && endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    if (startHour > endHour || (startHour === endHour && startMin >= endMin)) {
      errors.push("endTime must be after startTime");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  next();
}
