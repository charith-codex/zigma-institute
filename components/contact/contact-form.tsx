"use client";

import { type FormEvent, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { inquiryTypeLabels, type InquiryType } from "@/types/inquiries";

interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  inquiryType: InquiryType;
  message: string;
}

const createInitialState = (): ContactFormState => ({
  name: "",
  email: "",
  subject: "",
  inquiryType: "general",
  message: "",
});

export function ContactForm() {
  const [formState, setFormState] = useState<ContactFormState>(createInitialState);
  const [isPending, startTransition] = useTransition();

  const handleChange = (
    field: keyof ContactFormState,
    value: string
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name.trim() || !formState.email.trim() || !formState.subject.trim()) {
      toast.error("Please fill in your name, email, and subject.");
      return;
    }

    if (!formState.message.trim()) {
      toast.error("Please include a message so we can assist you.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formState),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to submit your inquiry.");
        }

        setFormState(createInitialState());
        toast.success("Thanks for reaching out! We will respond via email soon.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong.";
        toast.error(message);
      }
    });
  };

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            value={formState.name}
            onChange={(event) => handleChange("name", event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formState.email}
            onChange={(event) => handleChange("email", event.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          placeholder="How can we help?"
          value={formState.subject}
          onChange={(event) => handleChange("subject", event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inquiryType">Inquiry Type</Label>
        <Select
          value={formState.inquiryType}
          onValueChange={(value) => handleChange("inquiryType", value)}
        >
          <SelectTrigger id="inquiryType" className="h-11 w-full">
            <SelectValue placeholder="Select inquiry type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(inquiryTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          className="min-h-[140px]"
          placeholder="Type your message here..."
          value={formState.message}
          onChange={(event) => handleChange("message", event.target.value)}
          required
        />
      </div>
      <Button className="w-full md:w-auto md:self-start" type="submit" disabled={isPending}>
        <Send className="w-4 h-4 mr-2" />
        {isPending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}

export default ContactForm;
