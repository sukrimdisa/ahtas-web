import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Services
  const services = await prisma.service.createMany({
    data: [
      { name: "Urutan tradisional satu badan", price: 100, duration: 90 },
      { name: "Urutan separuh badan", price: 50, duration: 45 },
      { name: "Urutan kesejahteraan lelaki", price: 70, duration: 60 },
      { name: "Refleksologi 1 jam", price: 60, duration: 60 }
    ]
  });
  console.log(`✅ Created ${services.count} services`);

  // Create Admin User
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin AHTAS",
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

  const therapist2Password = await bcrypt.hash("therapist123", 10);
  const therapist2User = await prisma.user.create({
    data: {
      name: "Fatimah Ahmad",
      email: "fatimah@ahtas.com",
      password: therapist2Password,
      role: "THERAPIST"
    }
  });

  // Create Therapist Profiles
  const therapist1 = await prisma.therapist.create({
    data: {
      userId: therapist1User.id,
      commission: 0.7
    }
  });

  const therapist2 = await prisma.therapist.create({
    data: {
      userId: therapist2User.id,
      commission: 0.7
    }
  });
  console.log(`✅ Created 2 therapists`);

  // Create Customer User
  const customerPassword = await bcrypt.hash("customer123", 10);
  const customer = await prisma.user.create({
    data: {
      name: "Ahmad Ibrahim",
      email: "ahmad@customer.com",
      password: customerPassword,
      role: "CUSTOMER"
    }
  });
  console.log(`✅ Created customer user: ${customer.email}`);

  // Link therapists to all services
  const allServices = await prisma.service.findMany();
  for (const service of allServices) {
    await prisma.therapistService.createMany({
      data: [
        { therapistId: therapist1.id, serviceId: service.id },
        { therapistId: therapist2.id, serviceId: service.id }
      ]
    });
  }
  console.log(`✅ Linked therapists to services`);

  // Create sample availability for next 7 days
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    await prisma.availability.createMany({
      data: [
        {
          therapistId: therapist1.id,
          date: date,
          startTime: "09:00",
          endTime: "17:00"
        },
        {
          therapistId: therapist2.id,
          date: date,
          startTime: "10:00",
          endTime: "18:00"
        }
      ]
    });
  }
  console.log(`✅ Created availability for next 7 days`);

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📝 Login credentials:");
  console.log("Admin: admin@ahtas.com / admin123");
  console.log("Therapist 1: siti@ahtas.com / therapist123");
  console.log("Therapist 2: fatimah@ahtas.com / therapist123");
  console.log("Customer: ahmad@customer.com / customer123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
