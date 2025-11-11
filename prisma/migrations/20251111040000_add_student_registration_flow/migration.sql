-- AlterTable
ALTER TABLE "Student" ADD COLUMN "idCardKey" TEXT;
ALTER TABLE "Student" ADD COLUMN "idCardUrl" TEXT;

-- CreateEnum
CREATE TYPE "StudentRegistrationStatus" AS ENUM ('PENDING', 'PAID', 'APPROVED', 'FAILED');

-- CreateTable
CREATE TABLE "StudentRegistration" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "school" TEXT,
    "guardianName" TEXT NOT NULL,
    "guardianEmail" TEXT NOT NULL,
    "guardianPhone" TEXT NOT NULL,
    "contactPreference" TEXT,
    "goals" TEXT,
    "studentPhotoUrl" TEXT NOT NULL,
    "studentPhotoKey" TEXT NOT NULL,
    "totalAmountInCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "StudentRegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "stripeSessionId" TEXT,
    "studentUserId" TEXT,
    "studentPublicId" TEXT,
    "idCardUrl" TEXT,
    "idCardKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentRegistrationCourse" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentRegistrationCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentRegistration_stripeSessionId_key" ON "StudentRegistration"("stripeSessionId");
CREATE UNIQUE INDEX "StudentRegistration_studentUserId_key" ON "StudentRegistration"("studentUserId");
CREATE UNIQUE INDEX "StudentRegistrationCourse_registrationId_courseId_key" ON "StudentRegistrationCourse"("registrationId", "courseId");

-- AddForeignKey
ALTER TABLE "StudentRegistration" ADD CONSTRAINT "StudentRegistration_studentUserId_fkey" FOREIGN KEY ("studentUserId") REFERENCES "Student"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudentRegistrationCourse" ADD CONSTRAINT "StudentRegistrationCourse_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "StudentRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentRegistrationCourse" ADD CONSTRAINT "StudentRegistrationCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
