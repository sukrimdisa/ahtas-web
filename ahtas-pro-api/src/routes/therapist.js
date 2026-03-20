import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getTherapists(req, res) {
  const therapists = await prisma.therapist.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      services: { include: { service: true } },
      availability: true
    }
  });
  res.json(therapists);
}

export async function getTherapist(req, res) {
  const therapist = await prisma.therapist.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      services: { include: { service: true } },
      availability: true,
      appointments: {
        include: { service: true },
        orderBy: { startDt: "desc" }
      }
    }
  });
  if (!therapist) return res.status(404).json({ error: "Therapist not found" });
  res.json(therapist);
}

export async function getTherapistIncome(req, res) {
  const { id } = req.params;
  
  const therapist = await prisma.therapist.findUnique({
    where: { id },
    include: { user: { select: { name: true } } }
  });
  if (!therapist) return res.status(404).json({ error: "Therapist not found" });

  const appointments = await prisma.appointment.findMany({
    where: { therapistId: id }
  });

  const totalIncome = appointments.reduce((sum, b) => sum + b.therapistIncome, 0);
  const totalBookings = appointments.length;

  const monthlyIncome = {};
  appointments.forEach(a => {
    const month = new Date(a.startDt).toLocaleString("default", { month: "short", year: "numeric" });
    monthlyIncome[month] = (monthlyIncome[month] || 0) + a.therapistIncome;
  });

  res.json({
    therapist: therapist.user.name,
    totalIncome,
    totalBookings,
    monthlyIncome,
    commission: therapist.commission
  });
}

export async function setAvailability(req, res) {
  const { therapistId, date, startTime, endTime } = req.body;
  
  const availability = await prisma.availability.create({
    data: {
      therapistId,
      date: new Date(date),
      startTime,
      endTime
    }
  });
  res.json(availability);
}
