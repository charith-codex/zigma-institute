-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('pending_staff_approval', 'pending_teacher_confirmation', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ScheduleCreatedBy" AS ENUM ('teacher', 'staff');

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'approved',
    "createdBy" "ScheduleCreatedBy" NOT NULL DEFAULT 'staff',
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "notes" TEXT,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Schedule_date_idx" ON "Schedule"("date");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
