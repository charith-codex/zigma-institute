import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  Search,
  Filter,
  Clock,
  CheckCheck,
  Trash2,
  Send,
  Users,
  Calendar,
  DollarSign,
  BookOpen,
  GraduationCap,
  Settings,
  Archive,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

interface Notification {
  id: string;
  type: "student" | "exam" | "payment" | "system" | "class" | "teacher";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
  sender?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "student",
    title: "New Student Registration",
    message:
      "Sarah Johnson has registered for Computer Science course. Approval required.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    priority: "high",
    sender: "Registration System",
  },
  {
    id: "2",
    type: "exam",
    title: "Exam Schedule Updated",
    message:
      "Mathematics exam has been rescheduled to December 15, 2024 at 10:00 AM.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    priority: "medium",
    sender: "Exam Department",
  },
  {
    id: "3",
    type: "payment",
    title: "Fee Payment Received",
    message: "John Smith has paid $1,200 for Spring 2024 semester fees.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    read: true,
    priority: "low",
    sender: "Finance Department",
  },
  {
    id: "4",
    type: "system",
    title: "System Maintenance Notice",
    message:
      "Scheduled maintenance on December 10, 2024 from 2:00 AM to 4:00 AM EST.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    read: false,
    priority: "medium",
    sender: "IT Department",
  },
  {
    id: "5",
    type: "class",
    title: "Class Cancelled",
    message:
      "Advanced Physics class on December 8, 2024 has been cancelled due to teacher illness.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    read: true,
    priority: "high",
    sender: "Academic Office",
  },
  {
    id: "6",
    type: "teacher",
    title: "New Teacher Application",
    message:
      "Dr. Michael Brown has submitted an application for Mathematics position.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    read: true,
    priority: "medium",
    sender: "HR Department",
  },
];

export function Notifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("inbox");

  // Compose notification state
  const [composeTitle, setComposeTitle] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeRecipients, setComposeRecipients] = useState("");
  const [composePriority, setComposePriority] = useState<
    "low" | "medium" | "high"
  >("medium");

  const getNotificationIcon = (type: Notification["type"]) => {
    const iconMap = {
      student: Users,
      exam: Calendar,
      payment: DollarSign,
      system: Settings,
      class: BookOpen,
      teacher: GraduationCap,
    };
    const IconComponent = iconMap[type];
    return <IconComponent className="h-4 w-4" />;
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
        return "text-success";
      default:
        return "text-foreground";
    }
  };

  const getPriorityBadge = (priority: Notification["priority"]) => {
    const variants = {
      high: "destructive",
      medium: "secondary",
      low: "outline",
    } as const;

    return (
      <Badge variant={variants[priority]} className="text-xs">
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.sender?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === "all" || notification.type === filterType;

    const matchesRead =
      filterRead === "all" ||
      (filterRead === "read" && notification.read) ||
      (filterRead === "unread" && !notification.read);

    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const sendNotification = () => {
    if (!composeTitle.trim() || !composeMessage.trim()) return;

    const newNotification: Notification = {
      id: Date.now().toString(),
      type: "system",
      title: composeTitle,
      message: composeMessage,
      timestamp: new Date(),
      read: false,
      priority: composePriority,
      sender: "Admin",
    };

    setNotifications((prev) => [newNotification, ...prev]);
    setComposeTitle("");
    setComposeMessage("");
    setComposeRecipients("");
    setComposePriority("medium");
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
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Inbox
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archive
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
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

                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="class">Class</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterRead} onValueChange={setFilterRead}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
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
                      {searchQuery ||
                      filterType !== "all" ||
                      filterRead !== "all"
                        ? "Try adjusting your filters"
                        : "You're all caught up!"}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-4 hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${!notification.read ? "bg-primary/10" : "bg-muted"}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className={`font-medium text-sm ${getPriorityColor(notification.priority, notification.read)}`}
                              >
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-primary rounded-full"></div>
                              )}
                              {getPriorityBadge(notification.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(
                                notification.timestamp,
                                "MMM d, yyyy 'at' h:mm a"
                              )}
                              {notification.sender && (
                                <>
                                  <span>•</span>
                                  <span>{notification.sender}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                onClick={() => markAsRead(notification.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
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
                <label className="text-sm font-medium">Recipients</label>
                <Select
                  value={composeRecipients}
                  onValueChange={setComposeRecipients}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-students">All Students</SelectItem>
                    <SelectItem value="all-teachers">All Teachers</SelectItem>
                    <SelectItem value="all-admins">
                      All Administrators
                    </SelectItem>
                    <SelectItem value="specific-class">
                      Specific Class
                    </SelectItem>
                    <SelectItem value="custom">Custom Recipients</SelectItem>
                  </SelectContent>
                </Select>
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={composePriority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setComposePriority(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
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
                    setComposeRecipients("");
                    setComposePriority("medium");
                  }}
                >
                  Clear
                </Button>
                <Button onClick={sendNotification} className="btn-primary">
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
                      priority: "medium" as const,
                    },
                  },
                  {
                    title: "Class Cancellation",
                    description: "Notify about cancelled classes",
                    template: {
                      title: "Class Cancelled",
                      message:
                        "The [Subject] class scheduled for [Date] at [Time] has been cancelled due to [Reason]. We apologize for any inconvenience.",
                      priority: "high" as const,
                    },
                  },
                  {
                    title: "Fee Due Reminder",
                    description: "Remind about pending fee payments",
                    template: {
                      title: "Fee Payment Reminder",
                      message:
                        "This is a friendly reminder that your fee payment of $[Amount] is due on [Date]. Please make the payment to avoid late fees.",
                      priority: "medium" as const,
                    },
                  },
                  {
                    title: "System Maintenance",
                    description: "Inform about system maintenance",
                    template: {
                      title: "Scheduled System Maintenance",
                      message:
                        "The system will be under maintenance on [Date] from [Start Time] to [End Time]. During this period, the system will be temporarily unavailable.",
                      priority: "low" as const,
                    },
                  },
                ].map((template, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border rounded-lg space-y-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setComposeTitle(template.template.title);
                      setComposeMessage(template.template.message);
                      setComposePriority(template.template.priority);
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

        <TabsContent value="archive" className="space-y-6">
          <Card className="edu-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-primary" />
                Notification Archive
              </CardTitle>
              <CardDescription>
                View and manage archived notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  No archived notifications
                </h3>
                <p className="text-sm text-muted-foreground">
                  Notifications will appear here when they are archived
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="edu-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure notification preferences and templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Auto-delete Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h5 className="font-medium mb-2">Read Notifications</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      Automatically delete read notifications after:
                    </p>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h5 className="font-medium mb-2">Unread Notifications</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      Automatically delete unread notifications after:
                    </p>
                    <Select defaultValue="never">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Default Recipients</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      type: "Student Activities",
                      recipients: "All Students, Class Teachers",
                    },
                    {
                      type: "Exam Updates",
                      recipients: "All Students, Academic Staff",
                    },
                    {
                      type: "Fee Reminders",
                      recipients: "Students, Finance Team",
                    },
                    { type: "System Alerts", recipients: "All Administrators" },
                  ].map((setting, index) => (
                    <div
                      key={index}
                      className="p-4 border border-border rounded-lg"
                    >
                      <h5 className="font-medium mb-2">{setting.type}</h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        Current: {setting.recipients}
                      </p>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
