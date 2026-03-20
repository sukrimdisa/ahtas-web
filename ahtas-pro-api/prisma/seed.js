import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AHTAS PRO database...");

  // Create Services
  console.log("📋 Creating services...");
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Urutan tradisional satu badan",
        description: "Full body traditional massage - 90 minutes of complete relaxation",
        price: 100,
        duration: 90,
        isActive: true
      }
    }),
    prisma.service.create({
      data: {
        name: "Urutan separuh badan",
        description: "Half body massage focusing on upper or lower body",
        price: 50,
        duration: 45,
        isActive: true
      }
    }),
    prisma.service.create({
      data: {
        name: "Urutan kesejahteraan lelaki",
        description: "Men's wellness massage for stress relief and vitality",
        price: 70,
        duration: 60,
        isActive: true
      }
    }),
    prisma.service.create({
      data: {
        name: "Refleksologi 1 jam",
        description: "Reflexology treatment focusing on pressure points",
        price: 60,
        duration: 60,
        isActive: true
      }
    })
  ]);
  console.log(`✅ Created ${services.length} services`);

  // Create Admin User
  console.log("👤 Creating admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin Yot Therapy",
      email: "admin@yottherapy.com",
      password: hashedPassword,
      role: "ADMIN",
      phone: "+60123456789"
    }
  });
  console.log(`✅ Created admin: ${admin.email}`);

  // Create Sample Therapist
  console.log("💆 Creating sample therapist...");
  const therapistPassword = await bcrypt.hash("therapist123", 10);
  const therapistUser = await prisma.user.create({
    data: {
      name: "Siti Nurhaliza",
      email: "siti@yottherapy.com",
      password: therapistPassword,
      role: "THERAPIST",
      phone: "+60129876543"
    }
  });

  const therapist = await prisma.therapist.create({
    data: {
      userId: therapistUser.id,
      commission: 0.7,
      bio: "Experienced therapist with 10+ years in traditional massage",
      isActive: true
    }
  });

  // Assign all services to therapist
  await Promise.all(
    services.map(service =>
      prisma.therapistService.create({
        data: {
          therapistId: therapist.id,
          serviceId: service.id
        }
      })
    )
  );
  console.log(`✅ Created therapist: ${therapistUser.email} with all services`);

  // Create availability for next 7 days
  console.log("📅 Creating availability schedule...");
  const today = new Date();
  const availabilityPromises = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    availabilityPromises.push(
      prisma.availability.create({
        data: {
          therapistId: therapist.id,
          date: date,
          startTime: "09:00",
          endTime: "18:00",
          isAvailable: true
        }
      })
    );
  }
  await Promise.all(availabilityPromises);
  console.log(`✅ Created 7 days availability schedule`);

  // Create Sample Customer
  console.log("👥 Creating sample customer...");
  const customerPassword = await bcrypt.hash("customer123", 10);
  const customer = await prisma.user.create({
    data: {
      name: "Ahmad bin Ali",
      email: "ahmad@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      phone: "+60123334444"
    }
  });
  console.log(`✅ Created customer: ${customer.email}`);

  console.log("\n🎉 AHTAS PRO database seeded successfully!");
  console.log("\n📝 Default Accounts:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("ADMIN:");
  console.log("  Email: admin@yottherapy.com");
  console.log("  Password: admin123");
  console.log("\nTHERAPIST:");
  console.log("  Email: siti@yottherapy.com");
  console.log("  Password: therapist123");
  console.log("\nCUSTOMER:");
  console.log("  Email: ahmad@example.com");
  console.log("  Password: customer123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
