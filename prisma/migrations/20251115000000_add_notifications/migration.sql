-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('LMS', 'CMS');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('STUDENT', 'EXAM', 'PAYMENT', 'SYSTEM', 'CLASS', 'TEACHER', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationCategory" NOT NULL DEFAULT 'SYSTEM',
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "sender" TEXT,
    "targets" "NotificationChannel"[] NOT NULL DEFAULT ARRAY[]::"NotificationChannel"[],
    "readBy" "NotificationChannel"[] DEFAULT ARRAY[]::"NotificationChannel"[],
    "hiddenFor" "NotificationChannel"[] DEFAULT ARRAY[]::"NotificationChannel"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
