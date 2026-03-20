import { Router } from "express";
import { prisma } from "../config/db.js";

const router = Router();

// Get all therapists
router.get("/", async (req, res) => {
  try {
    const therapists = await prisma.therapist.findMany({
      include: {
        user: true,
        services: {
          include: { service: true }
        }
      }
    });
    res.json(therapists);
  } catch (error) {
    console.error("Get therapists error:", error);
    res.status(500).json({ error: "Failed to fetch therapists" });
  }
});

// Get therapist income dashboard
router.get("/:id/income", async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await prisma.therapist.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!therapist) {
      return res.status(404).json({ error: "Therapist not found" });
    }

    const bookings = await prisma.appointment.findMany({
      where: { therapistId: id },
      include: { service: true }
    });

    const totalIncome = bookings.reduce(
      (sum, b) => sum + b.therapistIncome,
      0
    );

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce(
      (sum, b) => sum + b.totalAmount,
      0
    );

    res.json({
      therapist: {
        id: therapist.id,
        name: therapist.user.name,
        commission: therapist.commission
      },
      stats: {
        totalBookings,
        totalRevenue,
        totalIncome,
        averagePerBooking: totalBookings > 0 ? totalIncome / totalBookings : 0
      },
      bookings
    });
  } catch (error) {
    console.error("Get therapist income error:", error);
    res.status(500).json({ error: "Failed to fetch therapist income" });
  }
});

// Get therapist availability
router.get("/:id/availability", async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const where = { therapistId: id };
    if (date) {
      where.date = new Date(date);
    }

    const availability = await prisma.availability.findMany({
      where,
      orderBy: { date: "asc" }
    });

    res.json(availability);
  } catch (error) {
    console.error("Get availability error:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

export default router;
