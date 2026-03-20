import express from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
import { authenticateToken } from "../middleware/auth.js";
import { sendConfirmation } from "../config/mailer.js";
import { backupToSheets } from "../config/google.js";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /booking/appointments - Create new appointment (PRO Booking Engine)
 */
router.post("/appointments", authenticateToken, async (req, res) => {
  try {
    const { therapistId, serviceId, startDt, notes } = req.body;
    const customerId = req.user.id;

    // Validate input
    if (!therapistId || !serviceId || !startDt) {
      return res.status(400).json({ 
        error: "Therapist, service, and start date/time are required" 
      });
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
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!therapist) {
      return res.status(404).json({ error: "Therapist not found" });
    }

    // Get customer details
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: {
        name: true,
        email: true
      }
    });

    // Calculate end time
    const start = new Date(startDt);
    const end = new Date(start.getTime() + service.duration * 60000);

    // Check for conflicts
    const conflicts = await prisma.appointment.findMany({
      where: {
        therapistId,
        startDt: {
          lte: end
        },
        endDt: {
          gte: start
        },
        status: {
          in: ["CONFIRMED", "BOOKED"]
        }
      }
    });

    if (conflicts.length > 0) {
      return res.status(409).json({ 
        error: "Time slot not available",
        conflicts: conflicts.map(c => ({
          startDt: c.startDt,
          endDt: c.endDt
        }))
      });
    }

    // Calculate commission
    const therapistIncome = service.price * therapist.commission;

    // Generate booking reference
    const bookingRef = "AHTAS-" + uuid().slice(0, 8).toUpperCase();

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        bookingRef,
        customerId,
        therapistId,
        serviceId,
        startDt: start,
        endDt: end,
        totalAmount: service.price,
        therapistIncome,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        notes
      },
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
        service: true
      }
    });

    // Send confirmation email (async, don't wait)
    sendConfirmation(customer.email, {
      customerName: customer.name,
      bookingRef: appointment.bookingRef,
      service: service.name,
      date: start.toLocaleString('en-MY', { 
        dateStyle: 'full', 
        timeStyle: 'short',
        timeZone: 'Asia/Kuala_Lumpur'
      }),
      therapist: therapist.user.name,
      totalAmount: service.price,
      notes: notes || ""
    }).catch(err => console.error("Email send failed:", err));

    // Backup to Google Sheets (async, don't wait)
    backupToSheets({
      bookingRef: appointment.bookingRef,
      customerEmail: customer.email,
      therapistName: therapist.user.name,
      serviceName: service.name,
      startDt: start.toISOString(),
      totalAmount: service.price,
      therapistIncome,
      status: appointment.status,
      paymentStatus: appointment.paymentStatus
    }).catch(err => console.error("Sheets backup failed:", err));

    res.json(appointment);
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

/**
 * GET /booking/appointments - Get appointments (with filters)
 */
router.get("/appointments", authenticateToken, async (req, res) => {
  try {
    const { therapistId, customerId, status, startDate, endDate } = req.query;

    const where = {};

    if (therapistId) where.therapistId = therapistId;
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.startDt = {};
      if (startDate) where.startDt.gte = new Date(startDate);
      if (endDate) where.startDt.lte = new Date(endDate);
    }

    const appointments = await prisma.appointment.findMany({
      where,
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
        service: true
      },
      orderBy: {
        startDt: 'asc'
      }
    });

    res.json(appointments);
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ error: "Failed to get appointments" });
  }
});

/**
 * GET /booking/appointments/:id - Get appointment by ID
 */
router.get("/appointments/:id", authenticateToken, async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
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
        service: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Get appointment error:", error);
    res.status(500).json({ error: "Failed to get appointment" });
  }
});

/**
 * PATCH /booking/appointments/:id - Update appointment status
 */
router.patch("/appointments/:id", authenticateToken, async (req, res) => {
  try {
    const { status, paymentStatus, notes } = req.body;

    const data = {};
    if (status) data.status = status;
    if (paymentStatus) data.paymentStatus = paymentStatus;
    if (notes !== undefined) data.notes = notes;

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data,
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
        service: true
      }
    });

    res.json(appointment);
  } catch (error) {
    console.error("Update appointment error:", error);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

/**
 * DELETE /booking/appointments/:id - Cancel appointment
 */
router.delete("/appointments/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED" }
    });

    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

/**
 * GET /booking/availability - Check therapist availability
 */
router.get("/availability", async (req, res) => {
  try {
    const { therapistId, date } = req.query;

    if (!therapistId || !date) {
      return res.status(400).json({ 
        error: "Therapist ID and date are required" 
      });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get availability slots
    const availability = await prisma.availability.findMany({
      where: {
        therapistId,
        date: {
          gte: targetDate,
          lt: nextDay
        },
        isAvailable: true
      }
    });

    // Get booked appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        therapistId,
        startDt: {
          gte: targetDate,
          lt: nextDay
        },
        status: {
          in: ["CONFIRMED", "BOOKED"]
        }
      },
      select: {
        startDt: true,
        endDt: true,
        service: {
          select: {
            duration: true
          }
        }
      }
    });

    res.json({
      availability,
      bookedSlots: appointments
    });
  } catch (error) {
    console.error("Get availability error:", error);
    res.status(500).json({ error: "Failed to get availability" });
  }
});

export default router;
