import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { fetchShowcasePage } from "@/lib/showcase-data";
import type { ShowcaseContent, ShowcaseMedia } from "@/lib/generated/prisma";

const defaultModules = [
  {
    name: "EIMS Dashboard",
    description:
      "Manage admissions, attendance, finance, and institute-wide communications with automated alerts and analytics.",
    image:
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Learning Management System",
    description:
      "Deliver digital lessons, assignments, and AI-powered study support to keep every learner engaged and on track.",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Teacher CMS Portal",
    description:
      "Give educators a single workspace to publish resources, monitor progress, and collaborate with management in real time.",
    image:
      "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80",
  },
];

const defaultRoleHighlights = [
  {
    title: "Students",
    copy: "Self-register online, follow personalized study paths, and stay motivated with AI-driven reminders and progress dashboards.",
  },
  {
    title: "Teachers",
    copy: "Publish multimedia content, set quizzes, track paper marks, and receive AI assistance for lesson planning.",
  },
  {
    title: "Staff & Admins",
    copy: "Centralize attendance, payments, and communications while approving enrollments and managing multi operations securely.",
  },
];

const defaultKeyHighlights = [
  {
    icon: LayoutDashboard,
    title: "Unified Workflows",
    description:
      "One login intelligently routes each role to the right dashboard, keeping data accurate across EIMS, LMS, and CMS.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Security",
    description:
      "Role-based access, password resets, and audit-ready records ensure your data is safe and compliant.",
  },
  {
    icon: CalendarDays,
    title: "Timetables & Attendance",
    description:
      "Automated schedules sync with Google Calendar while QR-based attendance notifies guardians instantly.",
  },
  {
    icon: Sparkles,
    title: "AI Assistance",
    description:
      "Generate quizzes, summaries, study plans, and motivational nudges that keep every learner engaged.",
  },
];

const defaultTimeline = [
  {
    step: "01",
    title: "Online Student Registration",
    description:
      "Families submit program choices, guardianship details, and documents through our digital form.",
  },
  {
    step: "02",
    title: "Staff Approval & Onboarding",
    description:
      "Attendance or finance teams verify payments, assign classes, and trigger automated welcome emails.",
  },
  {
    step: "03",
    title: "Personalized Learning Begins",
    description:
      "Students sign in with secure credentials, unlock curated LMS content, and track their goals from day one.",
  },
];

const sortContent = (items: ShowcaseContent[]) =>
  [...items].sort(
    (a, b) =>
      a.order - b.order ||
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

const sortMedia = (items: ShowcaseMedia[]) =>
  [...items].sort(
    (a, b) =>
      a.order - b.order ||
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

export default async function ShowcaseSite() {
  const { contents, media } = await fetchShowcasePage("HOME");

  const selectBlocks = (section: string) =>
    sortContent(contents.filter((item) => item.section === section));
  const heroBlock = contents.find((item) => item.section === "hero");
  const heroImage = media.find((item) => item.section === "hero")?.imageUrl;

  const stats = selectBlocks("stat").map((item) => ({
    label: item.title ?? "Stat",
    value: item.subtitle ?? item.body ?? "",
  }));

  const moduleMedia = sortMedia(media.filter((item) => item.section === "module"));
  const modules = moduleMedia.length
    ? moduleMedia.map((item) => ({
        name: item.title,
        description: item.description ?? "",
        image: item.imageUrl,
      }))
    : defaultModules;

  const roleHighlights = selectBlocks("role").map((item) => ({
    title: item.title ?? "",
    copy: item.body ?? "",
  }));

  const keyHighlights = selectBlocks("highlight").map((item) => ({
    icon: Sparkles,
    title: item.title ?? "",
    description: item.body ?? "",
  }));

  const timeline = selectBlocks("timeline").map((item, index) => ({
    step: item.subtitle ?? `${String(index + 1).padStart(2, "0")}`,
    title: item.title ?? "",
    description: item.body ?? "",
  }));

  const heroStats = stats.length
    ? stats
    : [
        { label: "Active Learners", value: "3,500+" },
        { label: "Staff Workflows Automated", value: "45+" },
        { label: "Parent Satisfaction", value: "97%" },
        { label: "AI Study Sessions", value: "12k" },
      ];

  return (
    <div className="space-y-24 py-10 lg:space-y-32 lg:py-16">
      <section className="relative overflow-hidden rounded-3xl border bg-slate-950/95 text-slate-50 py-6 px-10">
        <Image
          src={
            heroImage ??
            "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=80"
          }
          alt="Students collaborating with laptops"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/95 to-primary/20" />
        <div className="relative z-10 wrapper flex flex-col gap-10 py-20 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.3em] text-primary">
              {heroBlock?.subtitle ?? "Future-Ready Institute"}
            </div>
            <h1 className="text-4xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              {heroBlock?.title ?? "Next-era educational experience with modern comfort zone"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {heroBlock?.body ??
                `${APP_NAME} unifies enrollment, communication, and analytics so your team can focus on what matters most student success.`}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={heroBlock?.ctaHref ?? "/student-registration"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-[1.02]"
              >
                {heroBlock?.ctaLabel ?? "Start Student Registration"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid w-full max-w-sm grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 backdrop-blur">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrapper space-y-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Three connected pillars</p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Everything your institute needs to manage, teach, and inspire
            </h2>
            <p className="text-base text-muted-foreground">
              From admissions to alumni, {APP_NAME} connects every team with smart dashboards, live reporting, and effortless collaboration.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Explore Courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {modules.map((module) => (
            <article
              key={module.name}
              className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={module.image}
                  alt={`${module.name} preview`}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />
              </div>
              <div className="relative space-y-3 p-6">
                <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-primary">
                  {heroBlock?.subtitle ?? "Zigma"}
                </div>
                <h3 className="text-xl font-semibold">{module.name}</h3>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="wrapper grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Why choose {APP_NAME}</p>
            <h2 className="text-3xl font-semibold sm:text-4xl">Designed for every role</h2>
            <p className="text-base text-muted-foreground">
              Personalized experiences keep each group focused. Update the highlights from the Website Management tab to keep this section fresh.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(roleHighlights.length ? roleHighlights : defaultRoleHighlights).map((role) => (
              <div key={role.title} className="rounded-2xl border bg-card p-4 shadow-sm">
                <h3 className="text-lg font-semibold">{role.title}</h3>
                <p className="text-sm text-muted-foreground">{role.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrapper space-y-10">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Platform highlights</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">Modern tools for confident learning</h2>
          <p className="text-base text-muted-foreground">
            From schedules to AI-powered support, every touchpoint keeps families and staff aligned.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(keyHighlights.length ? keyHighlights : defaultKeyHighlights).map((highlight) => {
            const Icon = highlight.icon ?? Sparkles;
            return (
              <div key={highlight.title} className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3 text-primary">
                  <Icon className="h-5 w-5" />
                  <h3 className="font-semibold">{highlight.title}</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{highlight.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-linear-to-br from-primary/10 via-transparent to-accent/10 py-16">
        <div className="wrapper space-y-10">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Enrollment journey</p>
            <h2 className="text-3xl font-semibold sm:text-4xl">A guided path for every learner</h2>
            <p className="text-base text-muted-foreground">
              Keep this roadmap current with Website Management so students always know the next step.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {(timeline.length ? timeline : defaultTimeline).map((item) => (
              <div key={item.title} className="relative rounded-2xl border bg-card p-6 shadow-sm">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
