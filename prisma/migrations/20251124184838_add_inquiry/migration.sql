-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('general', 'admission', 'technical', 'complaint', 'feedback');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('new', 'in_progress', 'resolved', 'closed');

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "inquiryType" "InquiryType" NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'new',
    "response" TEXT,
    "respondedAt" TIMESTAMP(3),
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);
