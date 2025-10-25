import { PrismaClient } from "@/lib/generated/prisma";
import { sampleCourses } from "./course-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing old data...");
  await prisma.course.deleteMany();

  console.log("Inserting sample courses...");
  await prisma.course.createMany({
    data: sampleCourses,
  });

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
