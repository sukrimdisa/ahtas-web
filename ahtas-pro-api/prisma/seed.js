import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.service.createMany({
    data: [
      { name: "Urutan tradisional satu badan", price: 100, duration: 90 },
      { name: "Urutan separuh badan", price: 50, duration: 45 },
      { name: "Urutan kesejahteraan lelaki", price: 70, duration: 60 },
      { name: "Refleksologi 1 jam", price: 60, duration: 60 }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
