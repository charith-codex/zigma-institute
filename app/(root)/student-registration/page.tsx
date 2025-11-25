import Link from "next/link";

import { StudentRegistrationForm } from "@/components/student-registration/RegistrationForm";
import { prisma } from "@/db/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, ShieldCheck, Users, Phone, Mail } from "lucide-react";

const infoHighlights = [
  {
    title: "Secure checkout",
    description: "Stripe-powered payments with instant confirmation.",
    icon: ShieldCheck,
  },
  {
    title: "Guided onboarding",
    description: "Admissions mentors review every submission within a day.",
    icon: Users,
  },
  {
    title: "Start quickly",
    description: "Same-day LMS access once payment clears.",
    icon: CalendarClock,
  },
];

const INSTITUTE_NAME = "Zigma Institute";
const INSTITUTE_TAGLINE =
  "AI-powered personalised learning for ambitious students.";
const INSTITUTE_ADDRESS = "Colombo Innovation Hub, 512 Galle Road, Colombo 03";

export default async function StudentRegisterPage() {
  const courses = await prisma.course.findMany({
    orderBy: { name: "asc" },
  });

  const registrationCourses = courses.map((course) => ({
    id: course.id,
    name: course.name,
    priceInCents: course.priceInCents,
    currency: course.currency,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl text-center mx-auto space-y-6">
            <Badge className="w-fit mx-auto">📋 Student Registration</Badge>
            <h1 className="text-4xl md:text-5xl font-bold">
              Register online and secure your place at {INSTITUTE_NAME}
            </h1>
            <p className="text-lg text-muted-foreground">
              A streamlined flow inspired by our About and Contact
              experiences complete the form, pick your courses, and finish
              payment in minutes.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href="#registration-form">Start registration</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Talk to our team</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div
            className="grid gap-10 lg:grid-cols-[3fr_2fr]"
            id="registration-form"
          >
            <StudentRegistrationForm
              courses={registrationCourses}
              instituteName={INSTITUTE_NAME}
              instituteTagline={INSTITUTE_TAGLINE}
              instituteAddress={INSTITUTE_ADDRESS}
            />

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">How it works</CardTitle>
                  <CardDescription>
                    Minimal steps, clear emails, and automatic updates.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground">
                      1. Submit form
                    </p>
                    <p>Share accurate student + guardian details.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      2. Pay online
                    </p>
                    <p>Secure Stripe Checkout handles every currency.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      3. Receive access
                    </p>
                    <p>We email LMS credentials and onboarding steps.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Need help?</CardTitle>
                  <CardDescription>
                    Reach our admissions desk directly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Hotline</p>
                      <Link
                        href="tel:0112223344"
                        className="text-primary hover:underline"
                      >
                        011 222 3344
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <Link
                        href="mailto:admissions@zigmainstitute.lk"
                        className="text-primary hover:underline"
                      >
                        admissions@zigmainstitute.lk
                      </Link>
                    </div>
                  </div>
                  <div className="rounded-lg border border-dashed p-4 text-xs">
                    <p className="font-medium text-foreground">Visit us</p>
                    <p>{INSTITUTE_ADDRESS}</p>
                  </div>
                  <div className="space-y-3 pt-2">
                    {infoHighlights.map((highlight) => {
                      const Icon = highlight.icon;
                      return (
                        <div
                          key={`${highlight.title}-support`}
                          className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3"
                        >
                          <div className="rounded-full bg-primary/10 p-2">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {highlight.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {highlight.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
