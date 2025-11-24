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
  dismissNotification as dismissNotificationAction,
  listNotifications,
  markChannelRead as markChannelReadAction,
  markNotificationRead as markNotificationReadAction,
} from "@/app/actions/notifications";
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
  markNotificationAsRead: (
    id: string,
    channel?: NotificationChannel
  ) => Promise<void>;
  markChannelAsRead: (channel: NotificationChannel) => Promise<void>;
  dismissNotification: (id: string, channel: NotificationChannel) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
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
      notifications.filter(
        (notification) =>
          notification.targets.includes(channel) &&
          !notification.hiddenFor.includes(channel)
      ),
    [notifications]
  );

  const getUnreadCount = useCallback(
    (channel: NotificationChannel) =>
      getNotificationsFor(channel).filter(
        (notification) => !notification.readBy.includes(channel)
      ).length,
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

  const markNotificationAsRead = useCallback(
    async (id: string, channel?: NotificationChannel) => {
      try {
        await markNotificationReadAction(id, channel);
        await refresh();
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    },
    [refresh]
  );

  const markChannelAsRead = useCallback(
    async (channel: NotificationChannel) => {
      try {
        await markChannelReadAction(channel);
        await refresh();
      } catch (error) {
        console.error("Failed to mark channel as read", error);
      }
    },
    [refresh]
  );

  const dismissNotification = useCallback(
    async (id: string, channel: NotificationChannel) => {
      try {
        await dismissNotificationAction(id, channel);
        await refresh();
      } catch (error) {
        console.error("Failed to dismiss notification", error);
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
      markNotificationAsRead,
      markChannelAsRead,
      dismissNotification,
      deleteNotification,
    }),
    [
      notifications,
      isLoading,
      refresh,
      getNotificationsFor,
      getUnreadCount,
      sendNotification,
      markNotificationAsRead,
      markChannelAsRead,
      dismissNotification,
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
