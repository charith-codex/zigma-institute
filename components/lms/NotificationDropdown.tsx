"use client";
import { useMemo, useState } from "react";
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
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { NotificationChannel, useNotificationCenter } from "@/components/providers/notification-provider";

interface NotificationDropdownProps {
  channel?: NotificationChannel;
}

export function NotificationDropdown({
  channel = "lms",
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const {
    getNotificationsFor,
    getUnreadCount,
    markNotificationAsRead,
    markChannelAsRead,
    dismissNotification,
  } = useNotificationCenter();

  const notifications = useMemo(
    () => getNotificationsFor(channel),
    [channel, getNotificationsFor]
  );
  const unreadCount = getUnreadCount(channel);

  const markAsRead = async (id: string) => {
    await markNotificationAsRead(id, channel);
  };

  const markAllAsRead = async () => {
    await markChannelAsRead(channel);
  };

  const deleteNotification = async (id: string) => {
    await dismissNotification(id, channel);
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
                  {notifications.map((notification) => {
                    const isRead = notification.readBy.includes(channel);
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-muted/30 transition-colors cursor-pointer ${
                          !isRead ? "bg-primary/5" : ""
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <Bell className="w-4 h-4 text-primary" />
                        </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4
                                className={`font-medium text-sm ${
                                  !isRead
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-1 ml-2">
                                {!isRead && (
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
                              className={`text-xs mb-2 ${
                                isRead ? "text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
