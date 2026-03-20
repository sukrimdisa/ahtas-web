import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AHTAS PRO database...");

  // Clear existing data
  await prisma.appointment.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.therapistService.deleteMany();
  await prisma.service.deleteMany();
  await prisma.therapist.deleteMany();
  await prisma.user.deleteMany();

  // Create Services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Urutan tradisional satu badan",
        price: 100,
        duration: 90,
        description: "Full body traditional massage therapy"
      }
    }),
    prisma.service.create({
      data: {
        name: "Urutan separuh badan",
        price: 50,
        duration: 45,
        description: "Half body massage therapy"
      }
    }),
    prisma.service.create({
      data: {
        name: "Urutan kesejahteraan lelaki",
        price: 70,
        duration: 60,
        description: "Men's wellness massage"
      }
    }),
    prisma.service.create({
      data: {
        name: "Refleksologi 1 jam",
        price: 60,
        duration: 60,
        description: "60-minute reflexology session"
      }
    })
  ]);

  console.log(`✅ Created ${services.length} services`);

  // Create Admin User
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin Yot",
      email: "admin@ahtas.com",
      password: adminPassword,
      role: "ADMIN"
    }
  });

  console.log(`✅ Created admin user: ${admin.email}`);

  // Create Therapist Users
  const therapist1Password = await bcrypt.hash("therapist123", 10);
  const therapist1User = await prisma.user.create({
    data: {
      name: "Siti Nurhaliza",
      email: "siti@ahtas.com",
      password: therapist1Password,
      role: "THERAPIST"
    }
  });

  const therapist1 = await prisma.therapist.create({
    data: {
      userId: therapist1User.id,
      commission: 0.7
    }
  });

  const therapist2Password = await bcrypt.hash("therapist123", 10);
  const therapist2User = await prisma.user.create({
    data: {
      name: "Aminah Ibrahim",
      email: "aminah@ahtas.com",
      password: therapist2Password,
      role: "THERAPIST"
    }
  });

  const therapist2 = await prisma.therapist.create({
    data: {
      userId: therapist2User.id,
      commission: 0.7
    }
  });

  console.log(`✅ Created 2 therapists`);

  // Assign all services to both therapists
  for (const service of services) {
    await prisma.therapistService.create({
      data: {
        therapistId: therapist1.id,
        serviceId: service.id
      }
    });
    await prisma.therapistService.create({
      data: {
        therapistId: therapist2.id,
        serviceId: service.id
      }
    });
  }

  console.log(`✅ Assigned services to therapists`);

  // Create sample customer
  const customerPassword = await bcrypt.hash("customer123", 10);
  const customer = await prisma.user.create({
    data: {
      name: "Ahmad Abdullah",
      email: "ahmad@customer.com",
      password: customerPassword,
      role: "CUSTOMER"
    }
  });

  console.log(`✅ Created sample customer: ${customer.email}`);

  // Create availability for next 7 days
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    // Morning slots
    await prisma.availability.create({
      data: {
        therapistId: therapist1.id,
        date: date,
        startTime: "09:00",
        endTime: "12:00",
        isAvailable: true
      }
    });

    await prisma.availability.create({
      data: {
        therapistId: therapist2.id,
        date: date,
        startTime: "09:00",
        endTime: "12:00",
        isAvailable: true
      }
    });

    // Afternoon slots
    await prisma.availability.create({
      data: {
        therapistId: therapist1.id,
        date: date,
        startTime: "14:00",
        endTime: "18:00",
        isAvailable: true
      }
    });

    await prisma.availability.create({
      data: {
        therapistId: therapist2.id,
        date: date,
        startTime: "14:00",
        endTime: "18:00",
        isAvailable: true
      }
    });
  }

  console.log(`✅ Created availability for next 7 days`);

  console.log("\n🎉 AHTAS PRO database seeded successfully!");
  console.log("\n📝 Login Credentials:");
  console.log("   Admin: admin@ahtas.com / admin123");
  console.log("   Therapist 1: siti@ahtas.com / therapist123");
  console.log("   Therapist 2: aminah@ahtas.com / therapist123");
  console.log("   Customer: ahmad@customer.com / customer123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
