-- CreateTable
CREATE TABLE "Tute" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TuteDistribution" (
    "id" TEXT NOT NULL,
    "tuteId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "distributed" BOOLEAN NOT NULL DEFAULT true,
    "distributedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TuteDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tute_courseId_name_key" ON "Tute"("courseId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TuteDistribution_tuteId_studentId_key" ON "TuteDistribution"("tuteId", "studentId");

-- AddForeignKey
ALTER TABLE "Tute" ADD CONSTRAINT "Tute_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TuteDistribution" ADD CONSTRAINT "TuteDistribution_tuteId_fkey" FOREIGN KEY ("tuteId") REFERENCES "Tute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TuteDistribution" ADD CONSTRAINT "TuteDistribution_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
