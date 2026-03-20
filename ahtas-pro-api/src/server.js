import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authMiddleware, requireRole } from "./middleware/auth.js";
import { getServices, bookAppointment, getAppointments, getAppointmentByRef } from "./routes/booking.js";
import { getTherapists, getTherapist, getTherapistIncome, setAvailability } from "./routes/therapist.js";
import { register, login, getMe } from "./routes/auth.js";
import { getDashboard, getAnalytics } from "./routes/admin.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/auth/me", authMiddleware, getMe);

app.get("/api/services", getServices);
app.get("/api/appointments", getAppointments);
app.get("/api/appointments/:ref", getAppointmentByRef);
app.post("/api/book", bookAppointment);

app.get("/api/therapists", getTherapists);
app.get("/api/therapists/:id", getTherapist);
app.get("/api/therapists/:id/income", getTherapistIncome);
app.post("/api/availability", authMiddleware, requireRole("ADMIN", "THERAPIST"), setAvailability);

app.get("/api/admin/dashboard", authMiddleware, requireRole("ADMIN"), getDashboard);
app.get("/api/admin/analytics", authMiddleware, requireRole("ADMIN"), getAnalytics);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`AHTAS PRO API running on port ${PORT}`));
