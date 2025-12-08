"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createNotification as createNotificationAction,
  deleteNotification as deleteNotificationAction,
  listNotifications,
} from "@/lib/actions/notifications";
import type {
  CreateNotificationInput,
  NotificationChannel,
  NotificationRecord,
} from "@/types/notifications";

export type {
  CreateNotificationInput,
  NotificationChannel,
  NotificationRecord,
} from "@/types/notifications";

interface NotificationContextValue {
  notifications: NotificationRecord[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  getNotificationsFor: (channel: NotificationChannel) => NotificationRecord[];
  getUnreadCount: (channel: NotificationChannel) => number;
  sendNotification: (input: CreateNotificationInput) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getNotificationsFor = useCallback(
    (channel: NotificationChannel) =>
      notifications.filter((notification) =>
        notification.targets.includes(channel)
      ),
    [notifications]
  );

  const getUnreadCount = useCallback(
    (channel: NotificationChannel) => getNotificationsFor(channel).length,
    [getNotificationsFor]
  );

  const sendNotification = useCallback(
    async (input: CreateNotificationInput) => {
      try {
        await createNotificationAction(input);
        await refresh();
      } catch (error) {
        console.error("Failed to send notification", error);
      }
    },
    [refresh]
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        await deleteNotificationAction(id);
        await refresh();
      } catch (error) {
        console.error("Failed to delete notification", error);
      }
    },
    [refresh]
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      isLoading,
      refresh,
      getNotificationsFor,
      getUnreadCount,
      sendNotification,
      deleteNotification,
    }),
    [
      notifications,
      isLoading,
      refresh,
      getNotificationsFor,
      getUnreadCount,
      sendNotification,
      deleteNotification,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationCenter() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationCenter must be used within a NotificationProvider"
    );
  }

  return context;
}
