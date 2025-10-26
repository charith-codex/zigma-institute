import { PrismaClient } from "@/lib/generated/prisma";
import { sampleCourses } from "./course-data";
import { sampleUsers } from "./user-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing old data...");
  await prisma.course.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("Inserting sample courses...");
  await prisma.course.createMany({
    data: sampleCourses,
  });
  await prisma.user.createMany({ data: sampleUsers });

  console.log("Database seeded successfully!");
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
