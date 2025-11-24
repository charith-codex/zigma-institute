"use server";

import { prisma } from "@/db/prisma";
import type {
  CreateNotificationInput,
  NotificationChannel,
  NotificationRecord,
} from "@/types/notifications";

type DbChannel = "LMS" | "CMS";

type NotificationEntity = {
  id: string;
  title: string;
  message: string;
  targets: DbChannel[];
  createdAt: Date;
};

const toDbChannel = (channel: NotificationChannel): DbChannel =>
  channel === "lms" ? "LMS" : "CMS";

const fromDbChannel = (channel: DbChannel): NotificationChannel =>
  channel === "LMS" ? "lms" : "cms";

const mapRecord = (record: NotificationEntity): NotificationRecord => ({
  id: record.id,
  title: record.title,
  message: record.message,
  createdAt: record.createdAt.toISOString(),
  targets: record.targets.map(fromDbChannel),
});

export async function listNotifications(
  channel?: NotificationChannel
): Promise<NotificationRecord[]> {
  const notifications = await prisma.notification.findMany({
    where: channel ? { targets: { has: toDbChannel(channel) } } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return notifications.map(mapRecord);
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<NotificationRecord | null> {
  const trimmedTitle = input.title.trim();
  const trimmedMessage = input.message.trim();

  if (!trimmedTitle || !trimmedMessage || input.targets.length === 0) {
    return null;
  }

  const targets = Array.from(new Set(input.targets)).map(toDbChannel);

  const record = await prisma.notification.create({
    data: {
      title: trimmedTitle,
      message: trimmedMessage,
      targets,
    },
  });

  return mapRecord(record);
}

export async function deleteNotification(id: string): Promise<void> {
  try {
    await prisma.notification.delete({ where: { id } });
  } catch (error) {
    console.error("Failed to delete notification", error);
  }
}
