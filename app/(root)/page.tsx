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

const modules = [
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

const roleHighlights = [
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
    copy: "Centralize attendance, payments, and communications while approving enrollments and managing multi-campus operations securely.",
  },
];

const keyHighlights = [
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

const timeline = [
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

export default function ShowcaseSite() {
  return (
    <div className="space-y-24 py-10 lg:space-y-32 lg:py-16">
      <section className="relative overflow-hidden rounded-3xl border bg-slate-950/95 text-slate-50 py-6 px-10">
        <Image
          src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=80"
          alt="Students collaborating with laptops"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-primary/20" />
        <div className="relative z-10 wrapper flex flex-col gap-10 py-20 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.3em] text-primary">
              Future-Ready Institute
            </div>
            <h1 className="text-4xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Next-era educational experience with modern comfort zone
            </h1>
            <p className="text-lg text-slate-200">
              {APP_NAME} unifies enrollment, academics, communication, and
              analytics so your team can focus on what matters most—student
              success.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/student-register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-[1.02]"
              >
                Start Student Registration
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-8 py-3 text-sm font-semibold text-slate-50 transition hover:border-primary hover:text-primary"
              >
                Sign In to your Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid w-full max-w-sm grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 backdrop-blur">
            <div className="rounded-xl bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Active Learners
              </p>
              <p className="mt-3 text-3xl font-semibold">3,500+</p>
            </div>
            <div className="rounded-xl bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Staff Workflows Automated
              </p>
              <p className="mt-3 text-3xl font-semibold">45+</p>
            </div>
            <div className="rounded-xl bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Parent Satisfaction
              </p>
              <p className="mt-3 text-3xl font-semibold">97%</p>
            </div>
            <div className="rounded-xl bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                AI Study Sessions
              </p>
              <p className="mt-3 text-3xl font-semibold">12k</p>
            </div>
          </div>
        </div>
      </section>

      <section className="wrapper space-y-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">
              Three connected pillars
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Everything your institute needs to manage, teach, and inspire
            </h2>
            <p className="text-base text-muted-foreground">
              From admissions to alumni, {APP_NAME} connects every team with
              smart dashboards, live reporting, and effortless collaboration.
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
              </div>
              <div className="space-y-3 p-6">
                <h3 className="text-xl font-semibold">{module.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  View demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="wrapper grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Designed for every role
          </span>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            A personalized experience from login to learning
          </h2>
          <p className="text-base text-muted-foreground">
            Role-aware dashboards ensure each stakeholder lands exactly where
            they need to work—from class scheduling and fee management to study
            plans and performance reports.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {roleHighlights.map((role) => (
              <div
                key={role.title}
                className="rounded-2xl border bg-card p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold">{role.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  {role.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div className="relative h-72 w-full overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80"
              alt="Teacher guiding students"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative h-48 w-full overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80"
                alt="Students celebrating success"
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative h-48 w-full overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80"
                alt="Administrator reviewing dashboards"
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="wrapper space-y-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">
              Why institutes choose us
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Technology that elevates every classroom moment
            </h2>
            <p className="text-base text-muted-foreground">
              From QR attendance to AI-powered study help, {APP_NAME} delivers
              delightful experiences across academic and administrative teams.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {keyHighlights.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border bg-card p-6 transition hover:-translate-y-1 hover:border-primary"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrapper space-y-10">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">
            Enrollment journey
          </p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Seamless onboarding from inquiry to classroom
          </h2>
          <p className="text-base text-muted-foreground">
            Our blended approval workflow keeps staff in control while giving
            families a transparent path into your institute.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {timeline.map((stage) => (
            <div
              key={stage.step}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <span className="text-4xl font-semibold text-primary/70">
                {stage.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{stage.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {stage.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrapper overflow-hidden rounded-3xl border bg-gradient-to-r from-primary/15 via-primary/5 to-primary/20 p-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center px-10">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">
              Stay connected
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Ready to experience the next era of institute management?
            </h2>
            <p className="text-base text-muted-foreground">
              Book a walkthrough with our team to see how {APP_NAME} unifies
              academic, financial, and operational excellence.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:scale-[1.02]"
              >
                Schedule a call
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 px-8 py-3 text-sm font-semibold text-primary transition hover:border-primary"
              >
                Explore campus life
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="relative h-64 w-full max-w-xs">
            <Image
              src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=600&q=80"
              alt="Student using tablet in library"
              fill
              sizes="(min-width: 1024px) 20vw, 60vw"
              className="rounded-3xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
