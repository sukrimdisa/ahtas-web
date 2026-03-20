import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get therapist income dashboard
router.get("/:id/income", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Build where clause
    const where = { therapistId: id };
    if (startDate || endDate) {
      where.startDt = {};
      if (startDate) where.startDt.gte = new Date(startDate);
      if (endDate) where.startDt.lte = new Date(endDate);
    }

    // Get bookings
    const bookings = await prisma.appointment.findMany({
      where,
      include: {
        service: true,
        customer: true
      },
      orderBy: { startDt: "desc" }
    });

    // Calculate totals
    const totalIncome = bookings.reduce((sum, b) => sum + b.therapistIncome, 0);
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalBookings = bookings.length;

    // Group by service
    const byService = {};
    bookings.forEach(b => {
      if (!byService[b.service.name]) {
        byService[b.service.name] = {
          count: 0,
          income: 0,
          revenue: 0
        };
      }
      byService[b.service.name].count++;
      byService[b.service.name].income += b.therapistIncome;
      byService[b.service.name].revenue += b.totalAmount;
    });

    res.json({
      summary: {
        totalIncome,
        totalRevenue,
        totalBookings,
        averageIncome: totalBookings > 0 ? totalIncome / totalBookings : 0
      },
      byService,
      bookings
    });
  } catch (error) {
    console.error("Error fetching therapist income:", error);
    res.status(500).json({ error: "Failed to fetch income data" });
  }
});

// Get therapist schedule
router.get("/:id/schedule", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const where = { therapistId: id };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.startDt = {
        gte: startDate,
        lt: endDate
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: true,
        customer: true
      },
      orderBy: { startDt: "asc" }
    });

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});

// Add availability
router.post("/:id/availability", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime } = req.body;

    const availability = await prisma.availability.create({
      data: {
        therapistId: id,
        date: new Date(date),
        startTime,
        endTime
      }
    });

    res.json(availability);
  } catch (error) {
    console.error("Error creating availability:", error);
    res.status(500).json({ error: "Failed to create availability" });
  }
});

// Get therapist profile
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await prisma.therapist.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true }
        },
        services: {
          include: {
            service: true
          }
        }
      }
    });

    if (!therapist) {
      return res.status(404).json({ error: "Therapist not found" });
    }

    res.json(therapist);
  } catch (error) {
    console.error("Error fetching therapist:", error);
    res.status(500).json({ error: "Failed to fetch therapist" });
  }
});

export default router;
