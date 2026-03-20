import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bookingRoutes from "./routes/booking.js";
import servicesRoutes from "./routes/services.js";
import therapistRoutes from "./routes/therapist.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    name: "AHTAS PRO API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      services: "/services",
      bookings: "/bookings",
      therapists: "/therapists",
      admin: "/admin"
    }
  });
});

// Routes
app.use("/services", servicesRoutes);
app.use("/bookings", bookingRoutes);
app.use("/therapists", therapistRoutes);
app.use("/admin", adminRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   AHTAS PRO API - Production Ready    ║
╚═══════════════════════════════════════╝

🚀 Server running on port ${PORT}
📊 Database: PostgreSQL
📧 Email: Configured
☁️  Google Sheets: Ready
💰 Commission: Auto-calculated

Endpoints:
  GET  /services
  POST /bookings
  GET  /bookings
  GET  /therapists
  GET  /therapists/:id/income
  GET  /admin/dashboard

Ready for Yot Therapy scale-up! 💪
  `);
});
