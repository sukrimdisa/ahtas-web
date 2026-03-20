import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
import { sendConfirmation } from "../config/mailer.js";
import { backupToSheets } from "../config/google.js";

const prisma = new PrismaClient();

export async function getServices(req, res) {
  const services = await prisma.service.findMany();
  res.json(services);
}

export async function bookAppointment(req, res) {
  try {
    const { customerId, therapistId, serviceId, date, customerEmail, customerName } = req.body;

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ error: "Service not found" });

    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
      include: { user: true }
    });
    if (!therapist) return res.status(404).json({ error: "Therapist not found" });

    const income = service.price * therapist.commission;

    const booking = await prisma.appointment.create({
      data: {
        bookingRef: "AHTAS-" + uuid().slice(0, 8).toUpperCase(),
        customerId,
        therapistId,
        serviceId,
        startDt: new Date(date),
        totalAmount: service.price,
        therapistIncome: income,
        status: "CONFIRMED",
        paymentStatus: "PAID"
      }
    });

    if (customerEmail) {
      await sendConfirmation(customerEmail, {
        bookingRef: booking.bookingRef,
        service: service.name,
        date: new Date(date).toLocaleString("ms-MY"),
        therapist: therapist.user.name,
        totalAmount: service.price
      });
    }

    await backupToSheets({
      bookingRef: booking.bookingRef,
      customerName,
      service: service.name,
      therapist: therapist.user.name,
      date: new Date(date).toISOString(),
      totalAmount: service.price,
      therapistIncome: income
    });

    res.json(booking);
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: "Booking failed" });
  }
}

export async function getAppointments(req, res) {
  const appointments = await prisma.appointment.findMany({
    include: {
      customer: { select: { name: true, email: true } },
      therapist: { include: { user: { select: { name: true } } } },
      service: true
    },
    orderBy: { startDt: "desc" }
  });
  res.json(appointments);
}

export async function getAppointmentByRef(req, res) {
  const appointment = await prisma.appointment.findUnique({
    where: { bookingRef: req.params.ref },
    include: {
      customer: { select: { name: true, email: true } },
      therapist: { include: { user: { select: { name: true } } } },
      service: true
    }
  });
  if (!appointment) return res.status(404).json({ error: "Not found" });
  res.json(appointment);
}
