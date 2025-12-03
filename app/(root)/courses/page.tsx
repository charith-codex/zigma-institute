import Link from "next/link";
import { CalendarRange, Layers3, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

const courseHighlights = [
  {
    title: "Guided cohorts",
    copy: "Small-group instruction backed by live dashboards so mentors react fast to progress spikes or dips.",
    icon: Users,
  },
  {
    title: "Layered content",
    copy: "Lessons, labs, and past papers stay synced across LMS, CMS, and EIMS just like on the About and Gallery pages.",
    icon: Layers3,
  },
  {
    title: "Adaptive schedules",
    copy: "Weekday, weekend, and evening blocks that flex around sports, exams, and travel plans.",
    icon: CalendarRange,
  },
];

const enrollmentSteps = [
  {
    title: "Browse & shortlist",
    detail:
      "Filter by grade or exam track, then save the sessions that match your goals.",
    accent: "Discover",
  },
  {
    title: "Submit details",
    detail:
      "Use the student registration form to share guardian contacts and preferred schedules.",
    accent: "Apply",
  },
  {
    title: "Secure your seat",
    detail:
      "Stripe checkout confirms payment and unlocks LMS access plus campus orientation dates.",
    accent: "Enroll",
  },
];

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-10 px-4 py-12">
        <section className="px-6 py-12 text-center md:px-10">
          <div className="mx-auto max-w-3xl space-y-6">
            <Badge className="bg-primary text-white">📑 Curated Programs</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Courses with Modern Educational Experience
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose focused study tracks. Every option stays synchronized
              across LMS, CMS, and campus so families always know what comes
              next.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold">All Course</h2>
            <p className="text-muted-foreground">
              Tap into the latest cohorts below. Seats are updated in real time
              so you can reserve a spot without leaving the page.
            </p>
          </div>
          <AllCoursesCard data={courses} />
        </section>

        <section className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold">
              Why learners stay with Zigma
            </h2>
            <p className="text-muted-foreground">
              Minimal noise, clear milestones, and the same cohesive visual
              language used on our About and Gallery pages carry through every
              learning experience.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {courseHighlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <Card key={highlight.title} className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 text-primary">
                      <Icon className="size-6" />
                      <CardTitle className="text-xl">
                        {highlight.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {highlight.copy}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
