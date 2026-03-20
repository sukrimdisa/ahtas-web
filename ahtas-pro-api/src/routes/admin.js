import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getDashboard(req, res) {
  const [
    totalBookings,
    totalRevenue,
    therapistCount,
    customerCount,
    recentBookings,
    monthlyStats
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.aggregate({ _sum: { totalAmount: true } }),
    prisma.therapist.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.appointment.findMany({
      take: 10,
      orderBy: { startDt: "desc" },
      include: {
        customer: { select: { name: true } },
        service: { select: { name: true } },
        therapist: { include: { user: { select: { name: true } } } }
      }
    }),
    prisma.appointment.groupBy({
      by: ["status"],
      _count: true,
      _sum: { totalAmount: true }
    })
  ]);

  const topTherapists = await prisma.appointment.groupBy({
    by: ["therapistId"],
    _sum: { therapistIncome: true },
    orderBy: { _sum: { therapistIncome: "desc" } },
    take: 5
  });

  const therapistsWithNames = await Promise.all(
    topTherapists.map(async (t) => {
      const therapist = await prisma.therapist.findUnique({
        where: { id: t.therapistId },
        include: { user: { select: { name: true } } }
      });
      return {
        id: t.therapistId,
        name: therapist?.user.name || "Unknown",
        income: t._sum.therapistIncome
      };
    })
  );

  res.json({
    stats: {
      totalBookings,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      therapistCount,
      customerCount
    },
    recentBookings,
    topTherapists: therapistsWithNames,
    statusBreakdown: monthlyStats
  });
}

export async function getAnalytics(req, res) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const dailyBookings = await prisma.appointment.groupBy({
    by: ["startDt"],
    _count: true,
    _sum: { totalAmount: true },
    where: { startDt: { gte: thirtyDaysAgo } }
  });

  const serviceStats = await prisma.appointment.groupBy({
    by: ["serviceId"],
    _count: true,
    _sum: { totalAmount: true },
    orderBy: { _count: { serviceId: "desc" } }
  });

  const services = await prisma.service.findMany();
  const serviceMap = Object.fromEntries(services.map(s => [s.id, s]));

  res.json({
    dailyBookings: dailyBookings.map(d => ({
      date: d.startDt,
      count: d._count,
      revenue: d._sum.totalAmount
    })),
    serviceStats: serviceStats.map(s => ({
      service: serviceMap[s.serviceId]?.name || "Unknown",
      bookings: s._count,
      revenue: s._sum.totalAmount
    }))
  });
}
