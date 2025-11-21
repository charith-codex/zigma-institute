-- CreateTable
CREATE TABLE "PhysicalExamMark" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "studentRegistrationId" TEXT NOT NULL,
    "studentPublicId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "examTitle" TEXT NOT NULL,
    "paperUrl" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhysicalExamMark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PhysicalExamMark_courseId_idx" ON "PhysicalExamMark"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "PhysicalExamMark_courseId_studentRegistrationId_examTitle_key" ON "PhysicalExamMark"("courseId", "studentRegistrationId", "examTitle");

-- AddForeignKey
ALTER TABLE "PhysicalExamMark" ADD CONSTRAINT "PhysicalExamMark_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicalExamMark" ADD CONSTRAINT "PhysicalExamMark_studentRegistrationId_fkey" FOREIGN KEY ("studentRegistrationId") REFERENCES "StudentRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
