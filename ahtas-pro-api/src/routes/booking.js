import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
import { sendConfirmation } from "../config/mailer.js";

const prisma = new PrismaClient();

export async function bookAppointment(req, res) {
  try {
    const { customerId, therapistId, serviceId, date, email } = req.body;

    if (!customerId || !therapistId || !serviceId || !date || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId }
    });

    if (!therapist) {
      return res.status(404).json({ error: "Therapist not found" });
    }

    const income = service.price * therapist.commission;

    const booking = await prisma.appointment.create({
      data: {
        bookingRef: `AHTAS-${uuid().slice(0, 8)}`,
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

    await sendConfirmation(email, {
      bookingRef: booking.bookingRef,
      service: service.name,
      date,
      therapist: therapist.id
    });

    return res.json(booking);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create booking" });
  }
}
