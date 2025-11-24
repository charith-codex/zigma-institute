export type NotificationChannel = "lms" | "cms";

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  targets: NotificationChannel[];
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  targets: NotificationChannel[];
}
