import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { bookAppointment } from "./routes/booking.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/services", async (_req, res) => {
  const services = await prisma.service.findMany({
    orderBy: { name: "asc" }
  });
  res.json(services);
});

app.post("/book", bookAppointment);

app.get("/therapist/:id/income", async (req, res) => {
  const { id } = req.params;
  const bookings = await prisma.appointment.findMany({
    where: { therapistId: id }
  });

  const totalIncome = bookings.reduce(
    (sum, booking) => sum + booking.therapistIncome,
    0
  );

  res.json({ therapistId: id, totalIncome, bookings });
});

app.get("/admin/overview", async (_req, res) => {
  const [
    totalBookings,
    totalRevenue,
    customerCount,
    therapistCount
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.aggregate({
      _sum: { totalAmount: true }
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.therapist.count()
  ]);

  res.json({
    totalBookings,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    therapistCount,
    customerCount
  });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`AHTAS PRO API running on ${port}`);
});
