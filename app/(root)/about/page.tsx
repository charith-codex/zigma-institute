import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const coreModules = [
  {
    title: "EIMS Admin Dashboard",
    description:
      "Manage enrollments, staff, fees, attendance, schedules, and analytics from one command center tailored for management teams.",
    highlights: [
      "Role-based dashboards for management, IT, and attendance teams",
      "Automated fee tracking with Stripe & manual payment capture",
      "Attendance via QR cards with instant parent email alerts",
    ],
  },
  {
    title: "Learning Management System",
    description:
      "Deliver rich learning experiences with multimedia lessons, AI study aids, and continuous performance insights for every learner.",
    highlights: [
      "Upload videos, notes, tutes, and AI-generated study plans",
      "Assign quizzes, past papers, and monitor mastery progression",
      "Delight students with motivational quotes and Play Zone experiments",
    ],
  },
  {
    title: "Teacher LMS-CMS Portal",
    description:
      "Empower teachers to craft content, evaluate performance, and coordinate hybrid learning from a single workspace.",
    highlights: [
      "AI assistant for quiz and paper creation",
      "Track quiz + physical exam marks to close the feedback loop",
      "Collaborate with management on tute distribution and schedules",
    ],
  },
];

const pillars = [
  {
    title: "Unified Authentication",
    description:
      "One secure NextAuth login directs every role to the correct workspace with instant, role-aware navigation.",
  },
  {
    title: "Automation Built-In",
    description:
      "QR attendance, Google Calendar sync, payment reminders, and Resend-powered notifications keep operations humming.",
  },
  {
    title: "AI-Augmented Learning",
    description:
      "Gemini-driven study helpers and analytics translate raw performance data into actionable coaching moments.",
  },
  {
    title: "Parent Visibility",
    description:
      "Guardians receive timely updates on attendance, assessments, and outstanding fees so they stay engaged.",
  },
];

const milestones = [
  {
    period: "Week 1",
    title: "Institute Setup",
    detail:
      "Configure branding, import classes, seed staff accounts, and publish your showcase site within hours.",
  },
  {
    period: "Week 2",
    title: "Student Onboarding",
    detail:
      "Launch the online registration form, approve applicants, and generate digital ID cards plus LMS credentials.",
  },
  {
    period: "Week 3",
    title: "Operational Automations",
    detail:
      "Connect Stripe, sync Google Calendar, enable attendance QR flows, and roll out notifications to families.",
  },
  {
    period: "Week 4",
    title: "Insights & Growth",
    detail:
      "Unlock analytics dashboards highlighting class performance, finance trends, and leaderboard-ready achievements.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-16 py-12">
      <section className="grid gap-10 lg:grid-cols-[3fr_2fr] items-start">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            About Zigma Institute
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Building the smartest connected campus experience for ambitious
            learners.
          </h1>
          <p className="text-lg text-muted-foreground">
            Zigma Institute unifies admissions, classroom delivery, and parent
            engagement into a single digital ecosystem. From the first
            registration to every exam, we automate the busywork so your team
            can focus on inspiring students.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/student-registration">Student Registration</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">Staff & Student Sign In</Link>
            </Button>
          </div>
        </div>
        <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <CardHeader>
            <CardTitle className="text-2xl">Why institutes choose us</CardTitle>
            <CardDescription>
              A single platform that brings together operations, academics, and
              community stories.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm leading-relaxed text-muted-foreground">
            <p>
              Our modular suite eliminates siloed tools and patchwork logins.
              Each stakeholder—students, teachers, parents, and administrators—
              receives a tailored experience fueled by shared data.
            </p>
            <p>
              Password resets, onboarding checklists, and digital ID cards are
              automated, while our management dashboards surface the metrics
              that matter most to your leadership team.
            </p>
            <p className="font-semibold text-foreground">
              Result: faster enrollments, consistent teaching quality, and
              delighted families.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold">Core experience pillars</h2>
          <p className="text-muted-foreground">
            The foundation behind every module across the LMS, CMS, and EIMS
            environment.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar) => (
            <Card key={pillar.title}>
              <CardHeader>
                <CardTitle className="text-xl">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {pillar.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold">Everything your campus needs</h2>
          <p className="text-muted-foreground">
            A cohesive set of digital workspaces designed to scale from a single
            branch to a multi-location institute.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {coreModules.map((module) => (
            <Card key={module.title} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  {module.title}
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {module.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold">Launch timeline</h2>
          <p className="text-muted-foreground">
            A pragmatic rollout for teams balancing academics and operations.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {milestones.map((milestone) => (
            <Card key={milestone.period}>
              <CardHeader className="space-y-1">
                <CardDescription className="uppercase tracking-[0.2em] text-xs">
                  {milestone.period}
                </CardDescription>
                <CardTitle className="text-xl">{milestone.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {milestone.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}