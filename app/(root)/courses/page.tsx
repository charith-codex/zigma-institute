import Link from "next/link";
import {
  BookOpenCheck,
  CalendarCheck,
  GraduationCap,
  Layers3,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCourses } from "@/lib/actions/course";
import AllCoursesCard from "./AllCoursesCard";

const statHighlights = [
  {
    label: "Integrated pillars",
    value: "3 ecosystems",
    description:
      "LMS, CMS, and EIMS modules feed one connected learning journey.",
    icon: Layers3,
  },
  {
    label: "Teacher mentors",
    value: "40+ experts",
    description:
      "Subject specialists guide cohorts with live classes and digital assets.",
    icon: GraduationCap,
  },
  {
    label: "Flexible schedules",
    value: "Morning & evening",
    description:
      "Pick timetables that align with school, sports, and exam prep routines.",
    icon: CalendarCheck,
  },
  {
    label: "Verified credentials",
    value: "Staff vetted",
    description:
      "All teachers and support staff are onboarded by IT admins for safety.",
    icon: ShieldCheck,
  },
];

const pathways = [
  {
    title: "Foundation & Revision Tracks",
    focus:
      "Build core understanding for Grade 6-9 learners with weekly recaps, quizzes, and AI-powered flashcards.",
    outcomes: [
      "Continuous assessment insights for parents via dashboards",
      "Motivational Play Zone challenges to keep curiosity high",
      "Bridging assignments that transition smoothly into exam streams",
    ],
  },
  {
    title: "OL Mastery Streams",
    focus:
      "Exam-focused programs with past paper marathons, analytics-driven study plans, and targeted remedial lessons.",
    outcomes: [
      "Auto-generated study plans tuned by AI performance tracking",
      "Tute distribution audit trail so no student misses printed packs",
      "Leaderboards to celebrate improvements and top performers",
    ],
  },
  {
    title: "AL Excellence Studios",
    focus:
      "Hybrid workshops blending live labs, LMS content, and teacher CMS coaching for university-ready readiness.",
    outcomes: [
      "Google Calendar synced practicals and exam rehearsals",
      "Dedicated mentor reviews with digital + paper mark tracking",
      "Career guidance sessions with management staff advisers",
    ],
  },
];

const journeySteps = [
  {
    stage: "Discover",
    title: "Browse the course catalog",
    detail:
      "Filter courses by grade, exam stream, or module type. Every listing shows delivery format, duration, and upcoming start windows.",
  },
  {
    stage: "Apply",
    title: "Complete the student registration form",
    detail:
      "Share guardian contacts, academic goals, and preferred class slots so our staff can tailor the onboarding call.",
  },
  {
    stage: "Approve",
    title: "Payment team verifies and confirms",
    detail:
      "Finance staff review fee status, allocate the correct classes, and generate a secure LMS login for the student.",
  },
  {
    stage: "Launch",
    title: "Start learning across LMS + campus",
    detail:
      "Once approved, students unlock digital materials, attendance QR passes, and receive automated reminders for sessions.",
  },
];

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="space-y-16 py-12">
      <section className="grid gap-12 lg:grid-cols-[1.3fr_1fr] items-start">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Zigma Institute Courses
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Structured learning pathways that blend classroom mastery with
            always-on digital support.
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore courses crafted for every milestone—from foundational
            concepts to exam excellence. Our LMS, CMS, and EIMS modules work
            together so students, teachers, and families stay connected and on
            track.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/contact">Talk with an advisor</Link>
            </Button>
          </div>
        </div>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-2xl">
              Why families choose Zigma
            </CardTitle>
            <CardDescription>
              Our integrated ecosystem keeps academics, operations, and
              communication in sync.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            {statHighlights.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Icon className="size-5" />
                    {stat.label}
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold">
            Course pathways designed for outcomes
          </h2>
          <p className="text-muted-foreground">
            Each pathway combines structured content, mentor feedback, and
            analytics to ensure continuous improvement.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {pathways.map((pathway) => (
            <Card key={pathway.title} className="flex h-full flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{pathway.title}</CardTitle>
                <CardDescription>{pathway.focus}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-3 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">
                  What&apos;s included:
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  {pathway.outcomes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold">Latest course additions</h2>
          <p className="text-muted-foreground">
            New sessions are added every term. Secure a seat early to access
            digital materials and class schedules before orientation.
          </p>
        </div>
        <AllCoursesCard data={courses} />
      </section>

      <section className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold">Enrollment journey</h2>
          <p className="text-muted-foreground">
            A transparent process ensures every student is ready with verified
            credentials, scheduled classes, and support contacts.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {journeySteps.map((step) => (
            <Card key={step.stage} className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpenCheck className="size-5 text-primary" />
                  {step.stage}
                </CardTitle>
                <CardDescription>{step.title}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {step.detail}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
