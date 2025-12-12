"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useNotificationCenter } from "@/components/providers/notification-provider";

export function TeacherNotificationComposer() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const { sendNotification } = useNotificationCenter();

  const canSend = title.trim().length > 0 && message.trim().length > 0;

  const handleSend = async () => {
    if (!canSend) return;

    await sendNotification({
      title,
      message,
      targets: ["lms"],
    });

    setTitle("");
    setMessage("");
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Notify Students
        </CardTitle>
        <CardDescription>
          Post a quick alert to every student inside the LMS portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="teacher-notification-title">Title</Label>
          <Input
            id="teacher-notification-title"
            placeholder="Live session reminder"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="teacher-notification-message">Message</Label>
          <Textarea
            id="teacher-notification-message"
            placeholder="Share schedule changes, assignment tips or live links."
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>Notifications land instantly in the LMS bell menu.</span>
          <span>Recipients: All enrolled students</span>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setTitle("");
              setMessage("");
            }}
          >
            Reset
          </Button>
          <Button type="button" onClick={handleSend} disabled={!canSend}>
            <Send className="mr-2 h-4 w-4" />
            Send to LMS
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
