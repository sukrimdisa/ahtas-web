import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/booking.js";
import therapistRoutes from "./routes/therapist.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "🎉 AHTAS PRO API - Production-Grade Spa & Therapy System",
    version: "1.0.0",
    endpoints: {
      auth: "/auth/login, /auth/register",
      booking: "/booking/*",
      therapist: "/therapist/*",
      admin: "/admin/*"
    }
  });
});

app.use("/auth", authRoutes);
app.use("/booking", bookingRoutes);
app.use("/therapist", therapistRoutes);
app.use("/admin", adminRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log("\n🚀 AHTAS PRO API Server Started");
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("\n✅ Available endpoints:");
  console.log(`   - GET  /`);
  console.log(`   - POST /auth/login`);
  console.log(`   - POST /auth/register`);
  console.log(`   - GET  /booking/services`);
  console.log(`   - GET  /booking/therapists`);
  console.log(`   - POST /booking/book`);
  console.log(`   - GET  /therapist/:id/income`);
  console.log(`   - GET  /admin/dashboard`);
  console.log("\n💡 Ready to accept requests!\n");
});
