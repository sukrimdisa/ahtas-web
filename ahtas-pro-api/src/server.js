import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/booking.js";
import servicesRoutes from "./routes/services.js";
import therapistsRoutes from "./routes/therapists.js";
import adminRoutes from "./routes/admin.js";

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/booking", bookingRoutes);
app.use("/services", servicesRoutes);
app.use("/therapists", therapistsRoutes);
app.use("/admin", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    name: "AHTAS PRO API",
    version: "1.0.0",
    status: "running",
    description: "Production-Grade Spa & Therapy Booking System",
    endpoints: {
      auth: "/auth/*",
      booking: "/booking/*",
      services: "/services/*",
      therapists: "/therapists/*",
      admin: "/admin/*"
    }
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log("\n");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🌿 AHTAS PRO API - Production-Grade Spa & Therapy System");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 'SQLite'}`);
  console.log("═══════════════════════════════════════════════════════════");
  console.log("\n✅ Available Endpoints:");
  console.log("   POST   /auth/register");
  console.log("   POST   /auth/login");
  console.log("   GET    /auth/me");
  console.log("   GET    /services");
  console.log("   GET    /therapists");
  console.log("   GET    /therapists/:id/income");
  console.log("   POST   /booking/appointments");
  console.log("   GET    /booking/appointments");
  console.log("   GET    /booking/availability");
  console.log("   GET    /admin/dashboard");
  console.log("   GET    /admin/reports/revenue");
  console.log("\n🚀 Ready to accept requests!");
  console.log("═══════════════════════════════════════════════════════════\n");
});

export default app;
