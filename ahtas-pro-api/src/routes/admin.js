import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /admin/dashboard - Admin dashboard analytics (PRO Feature)
 */
router.get("/dashboard", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.startDt = {};
      if (startDate) dateFilter.startDt.gte = new Date(startDate);
      if (endDate) dateFilter.startDt.lte = new Date(endDate);
    }

    // Total bookings
    const totalBookings = await prisma.appointment.count({
      where: dateFilter
    });

    // Total revenue
    const appointments = await prisma.appointment.findMany({
      where: {
        ...dateFilter,
        status: {
          in: ["CONFIRMED", "COMPLETED"]
        }
      },
      select: {
        totalAmount: true,
        therapistIncome: true,
        status: true,
        startDt: true,
        endDt: true,
        service: {
          select: {
            duration: true
          }
        }
      }
    });

    const totalRevenue = appointments.reduce((sum, a) => sum + a.totalAmount, 0);
    const totalTherapistIncome = appointments.reduce((sum, a) => sum + a.therapistIncome, 0);
    const companyIncome = totalRevenue - totalTherapistIncome;

    // No-show count
    const noShowCount = await prisma.appointment.count({
      where: {
        ...dateFilter,
        status: "NO_SHOW"
      }
    });

    const noShowRate = totalBookings > 0 ? (noShowCount / totalBookings) * 100 : 0;

    // Calculate utilization
    // Total booked minutes
    const bookedMinutes = appointments.reduce((sum, a) => {
      return sum + a.service.duration;
    }, 0);

    // Available minutes (assume 8 hours/day per therapist)
    const therapistCount = await prisma.therapist.count();
    const daysInPeriod = startDate && endDate 
      ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
      : 30; // default 30 days
    const availableMinutes = therapistCount * daysInPeriod * 8 * 60;

    const utilization = availableMinutes > 0 
      ? (bookedMinutes / availableMinutes) * 100 
      : 0;

    // Customer count
    const customerCount = await prisma.user.count({
      where: { role: "CUSTOMER" }
    });

    // Therapist performance
    const therapistPerformance = await prisma.therapist.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        appointments: {
          where: {
            ...dateFilter,
            status: {
              in: ["CONFIRMED", "COMPLETED"]
            }
          },
          select: {
            therapistIncome: true,
            totalAmount: true
          }
        }
      }
    });

    const therapistStats = therapistPerformance.map(t => ({
      id: t.id,
      name: t.user.name,
      email: t.user.email,
      bookings: t.appointments.length,
      income: t.appointments.reduce((sum, a) => sum + a.therapistIncome, 0),
      revenue: t.appointments.reduce((sum, a) => sum + a.totalAmount, 0)
    }));

    // Popular services
    const serviceStats = await prisma.appointment.groupBy({
      by: ['serviceId'],
      where: {
        ...dateFilter,
        status: {
          in: ["CONFIRMED", "COMPLETED"]
        }
      },
      _count: {
        id: true
      },
      _sum: {
        totalAmount: true
      }
    });

    const popularServices = await Promise.all(
      serviceStats.map(async (stat) => {
        const service = await prisma.service.findUnique({
          where: { id: stat.serviceId }
        });
        return {
          service: service?.name,
          bookings: stat._count.id,
          revenue: stat._sum.totalAmount || 0
        };
      })
    );

    popularServices.sort((a, b) => b.bookings - a.bookings);

    // Recent bookings
    const recentBookings = await prisma.appointment.findMany({
      where: dateFilter,
      include: {
        customer: {
          select: {
            name: true,
            email: true
          }
        },
        therapist: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    res.json({
      summary: {
        totalBookings,
        totalRevenue,
        companyIncome,
        totalTherapistIncome,
        noShowCount,
        noShowRate: parseFloat(noShowRate.toFixed(2)),
        utilization: parseFloat(utilization.toFixed(2)),
        customerCount,
        bookedMinutes,
        availableMinutes
      },
      therapistPerformance: therapistStats,
      popularServices,
      recentBookings
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ error: "Failed to get dashboard data" });
  }
});

/**
 * GET /admin/users - Get all users (Admin only)
 */
router.get("/users", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const { role } = req.query;

    const where = {};
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        therapist: {
          select: {
            id: true,
            commission: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

/**
 * GET /admin/reports/revenue - Revenue report by period
 */
router.get("/reports/revenue", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year

    const appointments = await prisma.appointment.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "COMPLETED"]
        }
      },
      select: {
        totalAmount: true,
        therapistIncome: true,
        startDt: true,
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        startDt: 'asc'
      }
    });

    // Group by period
    const grouped = appointments.reduce((acc, a) => {
      const date = new Date(a.startDt);
      let key;

      switch (period) {
        case 'day':
          key = date.toISOString().slice(0, 10);
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10);
          break;
        case 'year':
          key = date.toISOString().slice(0, 4);
          break;
        case 'month':
        default:
          key = date.toISOString().slice(0, 7);
      }

      if (!acc[key]) {
        acc[key] = {
          period: key,
          revenue: 0,
          therapistIncome: 0,
          companyIncome: 0,
          bookings: 0
        };
      }

      acc[key].revenue += a.totalAmount;
      acc[key].therapistIncome += a.therapistIncome;
      acc[key].companyIncome += (a.totalAmount - a.therapistIncome);
      acc[key].bookings++;

      return acc;
    }, {});

    const report = Object.values(grouped).sort((a, b) => 
      a.period.localeCompare(b.period)
    );

    res.json(report);
  } catch (error) {
    console.error("Revenue report error:", error);
    res.status(500).json({ error: "Failed to generate revenue report" });
  }
});

export default router;
