-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('LMS', 'CMS');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "targets" "NotificationChannel"[],
    "readBy" "NotificationChannel"[] DEFAULT ARRAY[]::"NotificationChannel"[],
    "hiddenFor" "NotificationChannel"[] DEFAULT ARRAY[]::"NotificationChannel"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
