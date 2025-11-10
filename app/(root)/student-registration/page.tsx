import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RegistrationForm } from "@/components/student-registration/registration-form";

const enrollmentSteps = [
  {
    title: "Submit online registration",
    detail:
      "Share student details, guardian contacts, preferred classes, and academic goals using the secure form below.",
  },
  {
    title: "Staff verification",
    detail:
      "Our management staff review payment receipts, confirm class availability, and reach out if more information is needed.",
  },
  {
    title: "Account activation",
    detail:
      "Once approved, the system generates an LMS login, student ID, and welcome email with next steps.",
  },
  {
    title: "Begin learning",
    detail:
      "Students access the LMS for study materials, assignments, and AI-powered learning journeys on day one.",
  },
];

const documentChecklist = [
  "Latest school report or exam results (PDF)",
  "Copy of national ID or birth certificate",
  "Parent or guardian contact information",
  "Preferred class stream or programme",
];

export default function StudentRegisterPage() {
  return (
    <div className="space-y-16 py-12">
      <section className="grid items-start gap-10 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Student Registration
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Join Zigma Institute and unlock a personalized learning pathway.
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete the registration form to start the approval process. Our
            payment and management staff will verify your documents, set up your
            classes, and send your secure LMS credentials via email.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="#registration-form">Start the form</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Need assistance?</Link>
            </Button>
          </div>
        </div>
        <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <CardHeader>
            <CardTitle className="text-2xl">What happens next</CardTitle>
            <CardDescription>
              Every step is tracked in our EIMS to keep students, parents, and
              staff aligned.
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

      <section
        className="grid gap-8 lg:grid-cols-[2fr_1fr]"
        id="registration-form"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Student details</CardTitle>
            <CardDescription>
              Please ensure all information matches your official documents. All
              fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <RegistrationForm />
          </CardContent>
        </Card>
        <Card className="h-full border-dashed border-muted-foreground/40">
          <CardHeader>
            <CardTitle className="text-xl">Before you begin</CardTitle>
            <CardDescription>
              Preparing these details in advance speeds up verification and ID
              card generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Document checklist</p>
              <ul className="mt-2 space-y-1 list-disc pl-4">
                {documentChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">Need assistance?</p>
              <p>
                Our support team can help with payment plans or document
                questions. Email {" "}
                <Link
                  href="mailto:admissions@zigmainstitute.lk"
                  className="text-primary underline"
                >
                  admissions@zigmainstitute.lk
                </Link>{" "}
                or call +94 11 234 5678.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
