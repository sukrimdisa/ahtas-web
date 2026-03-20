import { Router } from "express";
import { v4 as uuid } from "uuid";
import { prisma } from "../config/db.js";
import { sendConfirmation } from "../config/mailer.js";
import { backupToSheets } from "../config/google.js";

const router = Router();

// Create booking
router.post("/", async (req, res) => {
  try {
    const { customerId, therapistId, serviceId, date, email } = req.body;

    // Validate required fields
    if (!customerId || !therapistId || !serviceId || !date || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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
      include: { user: true }
    });

    if (!therapist) {
      return res.status(404).json({ error: "Therapist not found" });
    }

    // Calculate therapist income
    const income = service.price * therapist.commission;

    // Create booking
    const bookingRef = "AHTAS-" + uuid().slice(0, 8).toUpperCase();
    
    const booking = await prisma.appointment.create({
      data: {
        bookingRef,
        customerId,
        therapistId,
        serviceId,
        startDt: new Date(date),
        totalAmount: service.price,
        therapistIncome: income,
        status: "CONFIRMED",
        paymentStatus: "PENDING"
      },
      include: {
        customer: true,
        therapist: { include: { user: true } },
        service: true
      }
    });

    // Send confirmation email
    await sendConfirmation(email, {
      bookingRef: booking.bookingRef,
      service: service.name,
      date: new Date(date).toLocaleString(),
      therapist: therapist.user.name,
      amount: service.price
    });

    // Backup to Google Sheets
    await backupToSheets([
      booking.bookingRef,
      booking.customer.name,
      booking.customer.email,
      service.name,
      new Date(date).toISOString(),
      service.price,
      income,
      booking.status
    ]);

    res.json(booking);
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await prisma.appointment.findMany({
      include: {
        customer: true,
        therapist: { include: { user: true } },
        service: true
      },
      orderBy: { startDt: "desc" }
    });
    res.json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Get booking by reference
router.get("/:ref", async (req, res) => {
  try {
    const booking = await prisma.appointment.findUnique({
      where: { bookingRef: req.params.ref },
      include: {
        customer: true,
        therapist: { include: { user: true } },
        service: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});

export default router;
