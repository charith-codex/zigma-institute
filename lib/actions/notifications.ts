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
  readBy: DbChannel[];
  hiddenFor: DbChannel[];
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
  readBy: record.readBy.map(fromDbChannel),
  hiddenFor: record.hiddenFor.map(fromDbChannel),
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
      readBy: [],
      hiddenFor: [],
    },
  });

  return mapRecord(record);
}

export async function markNotificationRead(
  id: string,
  channel?: NotificationChannel
): Promise<void> {
  const record = await prisma.notification.findUnique({ where: { id } });
  if (!record) return;

  const readBy = new Set(record.readBy);
  if (!channel) {
    record.targets.forEach((target) => readBy.add(target));
  } else if (record.targets.includes(toDbChannel(channel))) {
    readBy.add(toDbChannel(channel));
  }

  await prisma.notification.update({
    where: { id },
    data: { readBy: { set: Array.from(readBy) } },
  });
}

export async function markChannelRead(
  channel: NotificationChannel
): Promise<void> {
  const dbChannel = toDbChannel(channel);
  const records = await prisma.notification.findMany({
    where: { targets: { has: dbChannel } },
  });

  if (records.length === 0) return;

  await Promise.all(
    records.map((record) => {
      if (record.readBy.includes(dbChannel)) return null;

      const readBy = Array.from(new Set([...record.readBy, dbChannel]));
      return prisma.notification.update({
        where: { id: record.id },
        data: { readBy: { set: readBy } },
      });
    })
  );
}

export async function dismissNotification(
  id: string,
  channel: NotificationChannel
): Promise<void> {
  const record = await prisma.notification.findUnique({ where: { id } });
  if (!record) return;

  const dbChannel = toDbChannel(channel);
  const hiddenFor = Array.from(new Set([...record.hiddenFor, dbChannel]));

  await prisma.notification.update({
    where: { id },
    data: { hiddenFor: { set: hiddenFor } },
  });
}

export async function deleteNotification(id: string): Promise<void> {
  try {
    await prisma.notification.delete({ where: { id } });
  } catch (error) {
    console.error("Failed to delete notification", error);
  }
}
