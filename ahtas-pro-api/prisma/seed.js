import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Services
  const services = await prisma.service.createMany({
    data: [
      {
        name: "Urutan Tradisional Satu Badan",
        price: 100,
        duration: 90,
        description: "Full body traditional massage for deep relaxation"
      },
      {
        name: "Urutan Separuh Badan",
        price: 50,
        duration: 45,
        description: "Half body massage focusing on upper or lower body"
      },
      {
        name: "Urutan Kesejahteraan Lelaki",
        price: 70,
        duration: 60,
        description: "Specialized wellness massage for men"
      },
      {
        name: "Refleksologi 1 Jam",
        price: 60,
        duration: 60,
        description: "Reflexology treatment focusing on pressure points"
      },
      {
        name: "Urutan Kaki & Bahu",
        price: 40,
        duration: 30,
        description: "Targeted leg and shoulder massage"
      }
    ]
  });

  console.log(`✅ Created ${services.count} services`);

  // Create Admin User
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.create({
    data: {
      name: "Admin AHTAS",
      email: "admin@ahtas.com",
      password: hashedPassword,
      role: "ADMIN"
    }
  });

  console.log(`✅ Created admin user: ${admin.email}`);

  // Create Therapist Users
  const therapist1 = await prisma.user.create({
    data: {
      name: "Sarah Ahmad",
      email: "sarah@ahtas.com",
      password: await bcrypt.hash("therapist123", 10),
      role: "THERAPIST",
      therapist: {
        create: {
          commission: 0.7
        }
      }
    },
    include: {
      therapist: true
    }
  });

  const therapist2 = await prisma.user.create({
    data: {
      name: "Fatimah Ibrahim",
      email: "fatimah@ahtas.com",
      password: await bcrypt.hash("therapist123", 10),
      role: "THERAPIST",
      therapist: {
        create: {
          commission: 0.7
        }
      }
    },
    include: {
      therapist: true
    }
  });

  console.log(`✅ Created 2 therapists`);

  // Get all services
  const allServices = await prisma.service.findMany();

  // Assign services to therapists
  for (const service of allServices) {
    await prisma.therapistService.create({
      data: {
        therapistId: therapist1.therapist.id,
        serviceId: service.id
      }
    });

    await prisma.therapistService.create({
      data: {
        therapistId: therapist2.therapist.id,
        serviceId: service.id
      }
    });
  }

  console.log(`✅ Assigned services to therapists`);

  // Create Sample Customer
  const customer = await prisma.user.create({
    data: {
      name: "Ahmad Razak",
      email: "customer@example.com",
      password: await bcrypt.hash("customer123", 10),
      role: "CUSTOMER"
    }
  });

  console.log(`✅ Created sample customer: ${customer.email}`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📝 Login Credentials:");
  console.log("Admin: admin@ahtas.com / admin123");
  console.log("Therapist 1: sarah@ahtas.com / therapist123");
  console.log("Therapist 2: fatimah@ahtas.com / therapist123");
  console.log("Customer: customer@example.com / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
