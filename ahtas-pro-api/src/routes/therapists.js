import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /therapists - Get all therapists
 */
router.get("/", async (req, res) => {
  try {
    const therapists = await prisma.therapist.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        services: {
          include: {
            service: true
          }
        }
      }
    });

    res.json(therapists);
  } catch (error) {
    console.error("Get therapists error:", error);
    res.status(500).json({ error: "Failed to get therapists" });
  }
});

/**
 * GET /therapists/:id - Get therapist by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const therapist = await prisma.therapist.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        services: {
          include: {
            service: true
          }
        },
        availability: {
          orderBy: {
            date: 'asc'
          }
        }
      }
    });

    if (!therapist) {
      return res.status(404).json({ error: "Therapist not found" });
    }

    res.json(therapist);
  } catch (error) {
    console.error("Get therapist error:", error);
    res.status(500).json({ error: "Failed to get therapist" });
  }
});

/**
 * GET /therapists/:id/income - Get therapist income dashboard (PRO Feature)
 */
router.get("/:id/income", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Build date filter
    const where = {
      therapistId: id,
      status: {
        in: ["CONFIRMED", "COMPLETED"]
      }
    };

    if (startDate || endDate) {
      where.startDt = {};
      if (startDate) where.startDt.gte = new Date(startDate);
      if (endDate) where.startDt.lte = new Date(endDate);
    }

    // Get all appointments
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: {
          select: {
            name: true
          }
        },
        customer: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        startDt: 'desc'
      }
    });

    // Calculate totals
    const totalIncome = appointments.reduce((sum, a) => sum + a.therapistIncome, 0);
    const totalRevenue = appointments.reduce((sum, a) => sum + a.totalAmount, 0);
    const totalBookings = appointments.length;

    // Group by service
    const byService = appointments.reduce((acc, a) => {
      const serviceName = a.service.name;
      if (!acc[serviceName]) {
        acc[serviceName] = {
          count: 0,
          income: 0,
          revenue: 0
        };
      }
      acc[serviceName].count++;
      acc[serviceName].income += a.therapistIncome;
      acc[serviceName].revenue += a.totalAmount;
      return acc;
    }, {});

    // Group by month
    const byMonth = appointments.reduce((acc, a) => {
      const month = new Date(a.startDt).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          count: 0,
          income: 0,
          revenue: 0
        };
      }
      acc[month].count++;
      acc[month].income += a.therapistIncome;
      acc[month].revenue += a.totalAmount;
      return acc;
    }, {});

    res.json({
      summary: {
        totalIncome,
        totalRevenue,
        totalBookings,
        commissionRate: appointments[0]?.therapist?.commission || 0.7
      },
      byService,
      byMonth,
      recentAppointments: appointments.slice(0, 10)
    });
  } catch (error) {
    console.error("Get therapist income error:", error);
    res.status(500).json({ error: "Failed to get therapist income" });
  }
});

/**
 * POST /therapists/:id/services - Assign service to therapist (Admin only)
 */
router.post("/:id/services", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({ error: "Service ID is required" });
    }

    const assignment = await prisma.therapistService.create({
      data: {
        therapistId: req.params.id,
        serviceId
      },
      include: {
        service: true
      }
    });

    res.json(assignment);
  } catch (error) {
    console.error("Assign service error:", error);
    res.status(500).json({ error: "Failed to assign service" });
  }
});

/**
 * DELETE /therapists/:id/services/:serviceId - Remove service from therapist (Admin only)
 */
router.delete("/:id/services/:serviceId", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    await prisma.therapistService.delete({
      where: {
        therapistId_serviceId: {
          therapistId: req.params.id,
          serviceId: req.params.serviceId
        }
      }
    });

    res.json({ message: "Service removed from therapist" });
  } catch (error) {
    console.error("Remove service error:", error);
    res.status(500).json({ error: "Failed to remove service" });
  }
});

/**
 * PATCH /therapists/:id - Update therapist commission (Admin only)
 */
router.patch("/:id", authenticateToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const { commission } = req.body;

    if (commission === undefined) {
      return res.status(400).json({ error: "Commission rate is required" });
    }

    const therapist = await prisma.therapist.update({
      where: { id: req.params.id },
      data: {
        commission: parseFloat(commission)
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json(therapist);
  } catch (error) {
    console.error("Update therapist error:", error);
    res.status(500).json({ error: "Failed to update therapist" });
  }
});

export default router;
