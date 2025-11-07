"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  X,
  Clock,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type:
    | "assignment"
    | "exam"
    | "announcement"
    | "student"
    | "system"
    | "message";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif-001",
      type: "student",
      title: "New Student Enrollment",
      message: "Sarah Johnson enrolled in React Fundamentals (CLS00001)",
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      read: false,
      priority: "medium",
    },
    {
      id: "notif-002",
      type: "exam",
      title: "Exam Submission Alert",
      message:
        "Final exam for Full Stack Development has 3 pending submissions",
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      read: false,
      priority: "high",
    },
    {
      id: "notif-003",
      type: "assignment",
      title: "Assignment Due Soon",
      message:
        "React Components assignment due in 2 hours (5 students pending)",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      priority: "high",
    },
    {
      id: "notif-004",
      type: "announcement",
      title: "Course Schedule Update",
      message: "Monday lecture moved to 2 PM due to technical maintenance",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: true,
      priority: "medium",
    },
    {
      id: "notif-005",
      type: "message",
      title: "Student Query",
      message: "John Smith asked a question about useState hooks in Week 2",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      read: true,
      priority: "low",
    },
    {
      id: "notif-006",
      type: "system",
      title: "System Maintenance",
      message:
        "Scheduled maintenance completed successfully. All systems operational.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      read: true,
      priority: "low",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "student":
        return <User className="w-4 h-4 text-primary" />;
      case "exam":
        return <FileText className="w-4 h-4 text-warning" />;
      case "assignment":
        return <BookOpen className="w-4 h-4 text-accent" />;
      case "announcement":
        return <AlertCircle className="w-4 h-4 text-secondary" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-primary" />;
      case "system":
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (
    priority: Notification["priority"],
    read: boolean
  ) => {
    if (read) return "text-muted-foreground";
    switch (priority) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-warning";
      case "low":
        return "text-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="relative h-10 w-10 rounded-xl border-warning/20 hover:bg-warning/5 hover:border-warning/40 transition-all duration-300"
        >
          <Bell className="w-4 h-4 text-warning" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs bg-gradient-accent text-white shadow-soft border-0 p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-strong">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {unreadCount} new
                  </Badge>
                )}
              </CardTitle>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={markAllAsRead}
                  className="text-xs h-7 px-3"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="font-medium mb-2">No notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    You are all caught up! New notifications will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/30 transition-colors cursor-pointer ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4
                              className={`font-medium text-sm ${
                                !notification.read
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p
                            className={`text-xs mb-2 ${getPriorityColor(notification.priority, notification.read)}`}
                          >
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(notification.timestamp, {
                                addSuffix: true,
                              })}
                            </div>
                            {notification.priority === "high" &&
                              !notification.read && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs px-1 py-0"
                                >
                                  High
                                </Badge>
                              )}
                            {notification.priority === "medium" &&
                              !notification.read && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1 py-0 border-warning text-warning"
                                >
                                  Medium
                                </Badge>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {notifications.length > 0 && (
              <>
                <Separator />
                <div className="p-3">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    <Calendar className="w-3 h-3 mr-2" />
                    View all notifications
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
