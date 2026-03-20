import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Admin dashboard stats
router.get("/dashboard", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    // Total bookings
    const totalBookings = await prisma.appointment.count();

    // Total revenue
    const bookings = await prisma.appointment.findMany();
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTherapistIncome = bookings.reduce((sum, b) => sum + b.therapistIncome, 0);

    // Customer count
    const totalCustomers = await prisma.user.count({
      where: { role: "CUSTOMER" }
    });

    // Therapist count
    const totalTherapists = await prisma.therapist.count();

    // Recent bookings
    const recentBookings = await prisma.appointment.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        therapist: {
          include: { user: true }
        },
        service: true
      }
    });

    // Bookings by status
    const byStatus = await prisma.appointment.groupBy({
      by: ["status"],
      _count: true
    });

    // Revenue by service
    const serviceStats = await prisma.appointment.groupBy({
      by: ["serviceId"],
      _sum: {
        totalAmount: true
      },
      _count: true
    });

    const servicesWithStats = await Promise.all(
      serviceStats.map(async (stat) => {
        const service = await prisma.service.findUnique({
          where: { id: stat.serviceId }
        });
        return {
          service: service?.name,
          revenue: stat._sum.totalAmount,
          bookings: stat._count
        };
      })
    );

    // Therapist utilization
    const therapistStats = await prisma.appointment.groupBy({
      by: ["therapistId"],
      _count: true,
      _sum: {
        therapistIncome: true
      }
    });

    const therapistsWithStats = await Promise.all(
      therapistStats.map(async (stat) => {
        const therapist = await prisma.therapist.findUnique({
          where: { id: stat.therapistId },
          include: { user: true }
        });
        return {
          therapist: therapist?.user.name,
          bookings: stat._count,
          income: stat._sum.therapistIncome
        };
      })
    );

    res.json({
      summary: {
        totalBookings,
        totalRevenue,
        totalTherapistIncome,
        totalCustomers,
        totalTherapists,
        averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0
      },
      recentBookings,
      byStatus,
      serviceStats: servicesWithStats,
      therapistStats: therapistsWithStats
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Get all users
router.get("/users", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get all therapists with details
router.get("/therapists", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const therapists = await prisma.therapist.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        },
        services: {
          include: {
            service: true
          }
        },
        _count: {
          select: { appointments: true }
        }
      }
    });

    res.json(therapists);
  } catch (error) {
    console.error("Error fetching therapists:", error);
    res.status(500).json({ error: "Failed to fetch therapists" });
  }
});

// Get revenue report
router.get("/revenue", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const bookings = await prisma.appointment.findMany({
      where,
      include: {
        service: true,
        therapist: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTherapistIncome = bookings.reduce((sum, b) => sum + b.therapistIncome, 0);
    const profit = totalRevenue - totalTherapistIncome;

    res.json({
      summary: {
        totalRevenue,
        totalTherapistIncome,
        profit,
        bookingCount: bookings.length
      },
      bookings
    });
  } catch (error) {
    console.error("Error fetching revenue:", error);
    res.status(500).json({ error: "Failed to fetch revenue data" });
  }
});

export default router;
