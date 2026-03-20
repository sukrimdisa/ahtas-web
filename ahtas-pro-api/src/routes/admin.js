import { Router } from "express";
import { prisma } from "../config/db.js";

const router = Router();

// Admin dashboard stats
router.get("/dashboard", async (req, res) => {
  try {
    // Total bookings
    const totalBookings = await prisma.appointment.count();

    // Total revenue
    const bookings = await prisma.appointment.findMany();
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTherapistIncome = bookings.reduce((sum, b) => sum + b.therapistIncome, 0);
    const businessProfit = totalRevenue - totalTherapistIncome;

    // Customer count
    const totalCustomers = await prisma.user.count({
      where: { role: "CUSTOMER" }
    });

    // Therapist count
    const totalTherapists = await prisma.therapist.count();

    // Recent bookings
    const recentBookings = await prisma.appointment.findMany({
      take: 10,
      orderBy: { startDt: "desc" },
      include: {
        customer: true,
        therapist: { include: { user: true } },
        service: true
      }
    });

    // Therapist utilization
    const therapists = await prisma.therapist.findMany({
      include: {
        user: true,
        appointments: true
      }
    });

    const therapistStats = therapists.map(t => ({
      id: t.id,
      name: t.user.name,
      totalBookings: t.appointments.length,
      totalIncome: t.appointments.reduce((sum, a) => sum + a.therapistIncome, 0)
    }));

    res.json({
      overview: {
        totalBookings,
        totalRevenue,
        totalTherapistIncome,
        businessProfit,
        totalCustomers,
        totalTherapists
      },
      recentBookings,
      therapistStats
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

export default router;
