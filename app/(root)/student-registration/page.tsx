import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  "Copy of national ID / birth certificate",
  "Proof of payment (online receipt or bank slip)",
  "Parent or guardian contact information",
];

const classStreams = [
  "Ordinary Level Revision",
  "Advanced Level Science",
  "Advanced Level Commerce",
  "Advanced Level Technology",
  "English & Communication Skills",
  "AI & Emerging Tech Bootcamp",
];

export default function StudentRegisterPage() {
  return (
    <div className="space-y-16 py-12">
      <section className="grid gap-10 lg:grid-cols-[3fr_2fr] items-start">
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
        <Card className="bg-linear-to-br from-primary/10 via-background to-secondary/10">
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
            <form className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Student first name *</Label>
                  <Input id="firstName" name="firstName" placeholder="Amaya" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Student last name *</Label>
                  <Input id="lastName" name="lastName" placeholder="Perera" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of birth *</Label>
                  <Input id="dob" name="dob" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school">Current school</Label>
                  <Input
                    id="school"
                    name="school"
                    placeholder="Royal College"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentEmail">Student email *</Label>
                  <Input
                    id="studentEmail"
                    name="studentEmail"
                    type="email"
                    placeholder="student@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="(+94) 77 123 4567"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Parent / guardian name *</Label>
                  <Input
                    id="guardianName"
                    name="guardianName"
                    placeholder="Sunethra Perera"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianEmail">
                    Parent / guardian email *
                  </Label>
                  <Input
                    id="guardianEmail"
                    name="guardianEmail"
                    type="email"
                    placeholder="guardian@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">
                    Parent / guardian phone *
                  </Label>
                  <Input
                    id="guardianPhone"
                    name="guardianPhone"
                    placeholder="(+94) 71 987 6543"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPreference">
                    Preferred contact method
                  </Label>
                  <select
                    id="contactPreference"
                    name="contactPreference"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    defaultValue="email"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stream">Preferred class stream *</Label>
                  <select
                    id="stream"
                    name="stream"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <option value="">Select a stream</option>
                    {classStreams.map((stream) => (
                      <option key={stream} value={stream}>
                        {stream}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goals">Learning goals</Label>
                  <textarea
                    id="goals"
                    name="goals"
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    placeholder="Tell us about your target exams, subjects that need support, or clubs you want to join."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentRef">Payment reference *</Label>
                  <Input
                    id="paymentRef"
                    name="paymentRef"
                    placeholder="Stripe receipt ID or bank slip number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documents">
                    Upload supporting documents *
                  </Label>
                  <Input id="documents" name="documents" type="file" multiple />
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: PDF, JPG, or PNG (max 10MB each)
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  By submitting, you agree to our privacy policy and confirm
                  that details are accurate to the best of your knowledge.
                </p>
                <Button type="submit" size="lg">
                  Submit registration
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-8">
          <Card className="bg-muted/40">
            <CardHeader>
              <CardTitle className="text-xl">Documents checklist</CardTitle>
              <CardDescription>
                Upload clear scans to help our staff verify your enrollment
                quickly.
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
                Our admissions mentors can walk you through each step and
                arrange campus visits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">
                  Admissions hotline
                </p>
                <Link
                  href="tel:+94112223344"
                  className="text-primary hover:underline"
                >
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
                <p>Colombo Innovation Hub, 512 Galle Road, Colombo 03</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/contact">Book a consultation</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
