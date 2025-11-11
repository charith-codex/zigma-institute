import Link from "next/link";

import { StudentRegistrationForm } from "@/components/student-registration/RegistrationForm";
import { prisma } from "@/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const enrollmentSteps = [
  {
    title: "Submit your details",
    detail:
      "Complete the secure online form with accurate student and guardian information.",
  },
  {
    title: "Stripe Checkout",
    detail:
      "Select preferred courses, pay online, and receive an instant confirmation receipt.",
  },
  {
    title: "Automated onboarding",
    detail:
      "Our system verifies payment, generates a digital ID card, and creates LMS credentials.",
  },
  {
    title: "Email delivery",
    detail:
      "Student and guardian receive login credentials, course access, and the ID card download link.",
  },
];

const documentChecklist = [
  "Latest school report or exam results (PDF)",
  "Copy of national ID / birth certificate",
  "Proof of payment (online receipt or bank slip)",
  "Parent or guardian contact information",
];

const INSTITUTE_NAME = "Zigma Institute";
const INSTITUTE_TAGLINE = "AI-powered personalised learning for ambitious students.";
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
    <div className="space-y-16 py-12">
      <section className="grid items-start gap-10 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Student Registration
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Join {INSTITUTE_NAME} and unlock a personalised learning pathway.
          </h1>
          <p className="text-lg text-muted-foreground">
            Our end-to-end digital enrolment flow combines a modern registration form,
            automated Stripe payments, real-time LMS account provisioning, and professional
            ID card generation so students can start learning immediately.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="#registration-form"
              className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Start registration
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-md border border-input px-6 py-3 text-lg font-semibold text-foreground shadow-sm transition hover:bg-muted"
            >
              Need assistance?
            </Link>
          </div>
        </div>
        <Card className="bg-linear-to-br from-primary/10 via-background to-secondary/10">
          <CardHeader>
            <CardTitle className="text-2xl">Registration timeline</CardTitle>
            <CardDescription>
              Every milestone is tracked inside the Education Information Management System
              to keep families informed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {enrollmentSteps.map((step) => (
              <div key={step.title}>
                <p className="font-semibold text-foreground">{step.title}</p>
                <p>{step.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <StudentRegistrationForm
        courses={registrationCourses}
        instituteName={INSTITUTE_NAME}
        instituteTagline={INSTITUTE_TAGLINE}
        instituteAddress={INSTITUTE_ADDRESS}
      />

      <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <Card className="bg-muted/40">
          <CardHeader>
            <CardTitle className="text-xl">Documents checklist</CardTitle>
            <CardDescription>
              Upload clear scans to help our staff verify your enrolment quickly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="space-y-2">
              {documentChecklist.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Need help?</CardTitle>
            <CardDescription>
              Our admissions mentors can walk you through each step and arrange campus visits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Admissions hotline</p>
              <Link href="tel:+94112223344" className="text-primary hover:underline">
                +94 11 222 3344
              </Link>
            </div>
            <div>
              <p className="font-medium text-foreground">Email</p>
              <Link
                href="mailto:admissions@zigmainstitute.lk"
                className="text-primary hover:underline"
              >
                admissions@zigmainstitute.lk
              </Link>
            </div>
            <div>
              <p className="font-medium text-foreground">Visit us</p>
              <p>{INSTITUTE_ADDRESS}</p>
            </div>
            <Link
              href="/contact"
              className="inline-flex w-fit items-center rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Book a consultation
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
