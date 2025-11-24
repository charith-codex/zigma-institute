import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  Search,
  Clock,
  Trash2,
  Send,
} from "lucide-react";
import { format } from "date-fns";
import {
  NotificationChannel,
  useNotificationCenter,
} from "@/components/providers/notification-provider";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  targets: NotificationChannel[];
}

export function Notifications() {
  const {
    notifications: storedNotifications,
    sendNotification: pushNotification,
    deleteNotification: removeNotification,
  } = useNotificationCenter();
  const notifications = useMemo<Notification[]>(
    () =>
      storedNotifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        timestamp: new Date(notification.createdAt),
        targets: notification.targets,
      })),
    [storedNotifications]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");

  // Compose notification state
  const [composeTitle, setComposeTitle] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeTargets, setComposeTargets] = useState<NotificationChannel[]>([
    "lms",
    "cms",
  ]);

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const notificationCount = notifications.length;

  const deleteNotification = async (id: string) => {
    await removeNotification(id);
  };

  const toggleComposeTarget = (target: NotificationChannel) => {
    setComposeTargets((prev) =>
      prev.includes(target)
        ? prev.filter((value) => value !== target)
        : [...prev, target]
    );
  };

  const canSend =
    composeTitle.trim().length > 0 &&
    composeMessage.trim().length > 0 &&
    composeTargets.length > 0;

  const sendNotification = async () => {
    if (!canSend) return;

    await pushNotification({
      title: composeTitle,
      message: composeMessage,
      targets: composeTargets,
    });

    setComposeTitle("");
    setComposeMessage("");
    setComposeTargets(["lms", "cms"]);
    setActiveTab("inbox");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Notifications
            </h1>
            <p className="text-muted-foreground">
              Manage and view all system notifications
              {notificationCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {notificationCount} total
                </Badge>
              )}
            </p>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Compose
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-6">
          <Card className="edu-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">
                      No notifications found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? "Try a different search"
                        : "You're all caught up!"}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-3 p-4 hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors"
                    >
                      <div
                        className="p-2 rounded-lg bg-muted"
                      >
                        <Bell className="h-4 w-4" />
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className="font-medium text-sm text-foreground"
                              >
                                {notification.title}
                              </h4>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {notification.targets.map((target) => (
                                <Badge
                                  key={`${notification.id}-${target}`}
                                  variant="outline"
                                  className="text-[11px] uppercase"
                                >
                                  {target === "lms" ? "LMS" : "CMS"}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(
                                notification.timestamp,
                                "MMM d, yyyy 'at' h:mm a"
                              )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() =>
                              deleteNotification(notification.id)
                              }
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose" className="space-y-6">
          <Card className="edu-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Compose Notification
              </CardTitle>
              <CardDescription>
                Send a new notification to users or administrators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Deliver to</label>
                <div className="flex flex-wrap gap-2">
                  {[{ id: "lms", label: "Student LMS" }, { id: "cms", label: "Teacher CMS" }].map(
                    (option) => (
                      <Button
                        key={option.id}
                        type="button"
                        variant={
                          composeTargets.includes(option.id as NotificationChannel)
                            ? "default"
                            : "outline"
                        }
                        className="h-9"
                        onClick={() => toggleComposeTarget(option.id as NotificationChannel)}
                      >
                        {option.label}
                      </Button>
                    )
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Management and IT admins can alert LMS, CMS or both platforms at once.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Notification title"
                    value={composeTitle}
                    onChange={(e) => setComposeTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Type your notification message here..."
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setComposeTitle("");
                    setComposeMessage("");
                    setComposeTargets(["lms", "cms"]);
                  }}
                >
                  Clear
                </Button>
                <Button
                  onClick={sendNotification}
                  className="btn-primary"
                  disabled={!canSend}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="edu-card">
            <CardHeader>
              <CardTitle className="text-lg">Quick Templates</CardTitle>
              <CardDescription>
                Use pre-made templates for common notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[ 
                  {
                    title: "Exam Reminder",
                    description: "Remind students about upcoming exams",
                    template: {
                      title: "Upcoming Exam Reminder",
                      message:
                        "This is a reminder that your [Subject] exam is scheduled for [Date] at [Time]. Please ensure you arrive 15 minutes early and bring required materials.",
                    },
                  },
                  {
                    title: "Course Cancellation",
                    description: "Notify about cancelled classes",
                    template: {
                      title: "Course Cancelled",
                      message:
                        "The [Subject] class scheduled for [Date] at [Time] has been cancelled due to [Reason]. We apologize for any inconvenience.",
                    },
                  },
                  {
                    title: "Fee Due Reminder",
                    description: "Remind about pending fee payments",
                    template: {
                      title: "Fee Payment Reminder",
                      message:
                        "This is a friendly reminder that your fee payment of $[Amount] is due on [Date]. Please make the payment to avoid late fees.",
                    },
                  },
                  {
                    title: "System Maintenance",
                    description: "Inform about system maintenance",
                    template: {
                      title: "Scheduled System Maintenance",
                      message:
                        "The system will be under maintenance on [Date] from [Start Time] to [End Time]. During this period, the system will be temporarily unavailable.",
                    },
                  },
                ].map((template, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border rounded-lg space-y-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setComposeTitle(template.template.title);
                      setComposeMessage(template.template.message);
                    }}
                  >
                    <h4 className="font-medium">{template.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
