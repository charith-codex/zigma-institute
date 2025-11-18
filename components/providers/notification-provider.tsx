"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "zigma-notifications";

export type NotificationChannel = "lms" | "cms";
export type NotificationCategory =
  | "student"
  | "exam"
  | "payment"
  | "system"
  | "class"
  | "teacher"
  | "announcement";

export type NotificationPriority = "low" | "medium" | "high";

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: NotificationCategory;
  priority: NotificationPriority;
  sender?: string;
  createdAt: string;
  targets: NotificationChannel[];
  readBy: NotificationChannel[];
  hiddenFor: NotificationChannel[];
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  type?: NotificationCategory;
  priority?: NotificationPriority;
  sender?: string;
  targets: NotificationChannel[];
}

interface NotificationContextValue {
  notifications: NotificationRecord[];
  getNotificationsFor: (channel: NotificationChannel) => NotificationRecord[];
  getUnreadCount: (channel: NotificationChannel) => number;
  sendNotification: (input: CreateNotificationInput) => void;
  markNotificationAsRead: (id: string, channel?: NotificationChannel) => void;
  markChannelAsRead: (channel: NotificationChannel) => void;
  dismissNotification: (id: string, channel: NotificationChannel) => void;
  deleteNotification: (id: string) => void;
}

const defaultNotifications: NotificationRecord[] = [
  {
    id: "notif-default-1",
    title: "New Student Registration",
    message: "Sarah Johnson has registered for Computer Science.",
    type: "student",
    priority: "high",
    sender: "Registration System",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    targets: ["lms", "cms"],
    readBy: [],
    hiddenFor: [],
  },
  {
    id: "notif-default-2",
    title: "Exam Schedule Updated",
    message: "Mathematics exam moved to December 15, 10:00 AM.",
    type: "exam",
    priority: "medium",
    sender: "Exam Department",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    targets: ["lms"],
    readBy: [],
    hiddenFor: [],
  },
  {
    id: "notif-default-3",
    title: "Faculty Sync",
    message: "Weekly CMS sync today at 4:00 PM.",
    type: "announcement",
    priority: "low",
    sender: "IT Department",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    targets: ["cms"],
    readBy: [],
    hiddenFor: [],
  },
];

const NotificationContext = createContext<NotificationContextValue | null>(null);

const loadStoredNotifications = (): NotificationRecord[] => {
  if (typeof window === "undefined") {
    return defaultNotifications;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultNotifications;
    }

    const parsed = JSON.parse(stored) as NotificationRecord[];
    if (!Array.isArray(parsed)) {
      return defaultNotifications;
    }

    return parsed.map((notification) => ({
      ...notification,
      createdAt: notification.createdAt || new Date().toISOString(),
      readBy: notification.readBy || [],
      hiddenFor: notification.hiddenFor || [],
    }));
  } catch (error) {
    console.warn("Unable to read notifications from storage", error);
    return defaultNotifications;
  }
};

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>(() =>
    loadStoredNotifications()
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

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
    (input: CreateNotificationInput) => {
      if (!input.title.trim() || !input.message.trim()) {
        return;
      }

      const uniqueTargets = Array.from(new Set(input.targets));

      setNotifications((prev) => [
        {
          id: crypto.randomUUID(),
          title: input.title.trim(),
          message: input.message.trim(),
          type: input.type ?? "system",
          priority: input.priority ?? "medium",
          sender: input.sender,
          createdAt: new Date().toISOString(),
          targets: uniqueTargets,
          readBy: [],
          hiddenFor: [],
        },
        ...prev,
      ]);
    },
    []
  );

  const markNotificationAsRead = useCallback(
    (id: string, channel?: NotificationChannel) => {
      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification.id !== id) {
            return notification;
          }

          if (!channel) {
            return {
              ...notification,
              readBy: Array.from(
                new Set([...notification.readBy, ...notification.targets])
              ),
            };
          }

          if (!notification.targets.includes(channel)) {
            return notification;
          }

          if (notification.readBy.includes(channel)) {
            return notification;
          }

          return {
            ...notification,
            readBy: [...notification.readBy, channel],
          };
        })
      );
    },
    []
  );

  const markChannelAsRead = useCallback(
    (channel: NotificationChannel) => {
      setNotifications((prev) =>
        prev.map((notification) => {
          if (!notification.targets.includes(channel)) {
            return notification;
          }

          if (notification.readBy.includes(channel)) {
            return notification;
          }

          return {
            ...notification,
            readBy: [...notification.readBy, channel],
          };
        })
      );
    },
    []
  );

  const dismissNotification = useCallback(
    (id: string, channel: NotificationChannel) => {
      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification.id !== id) {
            return notification;
          }

          if (notification.hiddenFor.includes(channel)) {
            return notification;
          }

          return {
            ...notification,
            hiddenFor: [...notification.hiddenFor, channel],
          };
        })
      );
    },
    []
  );

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
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
