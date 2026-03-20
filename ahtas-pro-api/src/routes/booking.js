import express from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
import { sendConfirmation } from "../config/mailer.js";
import { backupToSheets } from "../config/google.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get all services
router.get("/services", async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" }
    });
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// Get therapists for a service
router.get("/therapists", async (req, res) => {
  try {
    const { serviceId } = req.query;

    let therapists;
    if (serviceId) {
      therapists = await prisma.therapist.findMany({
        where: {
          services: {
            some: { serviceId }
          }
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      });
    } else {
      therapists = await prisma.therapist.findMany({
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      });
    }

    res.json(therapists);
  } catch (error) {
    console.error("Error fetching therapists:", error);
    res.status(500).json({ error: "Failed to fetch therapists" });
  }
});

// Get availability for a therapist
router.get("/availability/:therapistId", async (req, res) => {
  try {
    const { therapistId } = req.params;
    const { date } = req.query;

    const where = { therapistId };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.date = {
        gte: startDate,
        lt: endDate
      };
    }

    const availability = await prisma.availability.findMany({
      where,
      orderBy: { date: "asc" }
    });

    res.json(availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// Create booking
router.post("/book", authenticateToken, async (req, res) => {
  try {
    const { therapistId, serviceId, startDt, customerEmail } = req.body;
    const customerId = req.user.id;

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Get therapist details
    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
      include: {
        user: true
      }
    });

    if (!therapist) {
      return res.status(404).json({ error: "Therapist not found" });
    }

    // Calculate income
    const income = service.price * therapist.commission;

    // Create booking
    const booking = await prisma.appointment.create({
      data: {
        bookingRef: "AHTAS-" + uuid().slice(0, 8).toUpperCase(),
        customerId,
        therapistId,
        serviceId,
        startDt: new Date(startDt),
        totalAmount: service.price,
        therapistIncome: income,
        status: "CONFIRMED",
        paymentStatus: "PAID"
      },
      include: {
        customer: true,
        therapist: {
          include: { user: true }
        },
        service: true
      }
    });

    // Send confirmation email
    await sendConfirmation(customerEmail || booking.customer.email, {
      bookingRef: booking.bookingRef,
      service: service.name,
      date: new Date(startDt).toLocaleString("ms-MY"),
      therapist: therapist.user.name,
      amount: service.price,
      paymentStatus: "PAID"
    });

    // Backup to Google Sheets
    await backupToSheets({
      bookingRef: booking.bookingRef,
      customerName: booking.customer.name,
      customerEmail: booking.customer.email,
      service: service.name,
      therapist: therapist.user.name,
      date: new Date(startDt).toISOString(),
      amount: service.price,
      therapistIncome: income,
      status: "CONFIRMED",
      paymentStatus: "PAID"
    });

    res.json(booking);
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// Get user's bookings
router.get("/my-bookings", authenticateToken, async (req, res) => {
  try {
    const bookings = await prisma.appointment.findMany({
      where: { customerId: req.user.id },
      include: {
        service: true,
        therapist: {
          include: { user: true }
        }
      },
      orderBy: { startDt: "desc" }
    });

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Get all bookings (admin only)
router.get("/all", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const bookings = await prisma.appointment.findMany({
      include: {
        customer: true,
        service: true,
        therapist: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

export default router;
