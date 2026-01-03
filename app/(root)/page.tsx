import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  BookOpen,
  Users,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import * as motion from "framer-motion/client";

import { APP_NAME } from "@/lib/constants";
import { HeroSlider } from "@/components/marketing/HeroSlider";

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
    icon: GraduationCap,
    color: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-500",
  },
  {
    title: "Teachers",
    copy: "Publish multimedia content, set quizzes, track paper marks, and receive AI assistance for lesson planning.",
    icon: BookOpen,
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
  },
  {
    title: "Staff & Admins",
    copy: "Centralize attendance, payments, and communications while approving enrollments and managing multi operations securely.",
    icon: Users,
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
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
    title: "Student ID & LMS Credentials",
    description:
      "A unique Student ID is generated, and LMS login credentials are sent to the student via email.",
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
    <div className="space-y-24 py-10 lg:space-y-32 lg:py-16 ">
      <div className="wrapper">
        <HeroSlider />
      </div>

      <section className="wrapper space-y-16 py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary border border-primary/20"
            >
              Three connected pillars
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl"
            >
              Everything your institute needs to manage, teach, and inspire
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              From admissions to alumni, {APP_NAME} connects every team with
              smart dashboards, live reporting, and effortless collaboration.
            </motion.p>
          </div>
          <Link
            href="/courses"
            className="group inline-flex items-center gap-2 text-sm font-bold text-primary transition-all hover:gap-3"
          >
            Explore Courses
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {modules.map((module, index) => (
            <motion.article
              key={module.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-2xl transition-all duration-300 hover:border-primary/50 hover:shadow-primary/5"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={module.image}
                  alt={`${module.name} preview`}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              <div className="relative space-y-4 p-8">
                <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                  {module.name}
                </h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
                  {module.description}
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-all hover:gap-3"
                >
                  View demo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Decorative accent */}
              <div className="absolute bottom-0 right-0 h-1 w-0 bg-linear-to-r from-primary to-purple-500 transition-all duration-500 group-hover:w-full" />
            </motion.article>
          ))}
        </div>
      </section>

      <section className="wrapper relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />

        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center relative z-10">
          <div className="space-y-10">
            <div className="space-y-4">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary border border-primary/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Designed for every role
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-bold tracking-tight sm:text-5xl lg:leading-[1.1]"
              >
                A modern experience from login to learning
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-muted-foreground leading-relaxed max-w-xl"
              >
                Role-aware dashboards ensure each stakeholder lands exactly
                where they need to work—from class scheduling and fee management
                to study plans and performance reports.
              </motion.p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {roleHighlights.map((role, index) => (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group relative rounded-3xl border border-border/50 bg-card/50 p-7 shadow-xl backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-primary/10"
                >
                  <div
                    className={`absolute inset-0 rounded-3xl bg-linear-to-br ${role.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />

                  <div className="relative z-10">
                    <div
                      className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted group-hover:bg-background transition-colors duration-300 ${role.iconColor} shadow-inner`}
                    >
                      <role.icon className="h-7 w-7 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                      {role.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
                      {role.copy}
                    </p>
                  </div>

                  {/* Decorative corner element */}
                  <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                </motion.div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-72 w-full overflow-hidden rounded-3xl shadow-2xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80"
                alt="Teacher guiding students"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative h-48 w-full overflow-hidden rounded-2xl shadow-xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80"
                  alt="Students celebrating success"
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 hover:scale-110"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative h-48 w-full overflow-hidden rounded-2xl shadow-xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80"
                  alt="Administrator reviewing dashboards"
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 hover:scale-110"
                />
              </motion.div>
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
              delightful experiences across administrative teams.
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

      {/* Enrollment Journey Section */}
      <section className="wrapper space-y-12">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-green-600 dark:text-green-400">
            <CalendarDays className="h-4 w-4" />
            Enrollment Journey
          </div>
          <h2 className="text-4xl font-bold sm:text-5xl leading-tight">
            Seamless onboarding from inquiry to classroom
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our blended approval workflow keeps staff in control while giving
            families a transparent path into your institute.
          </p>
        </div>
        <div className="relative">
          {/* Connection Line */}
          <div
            className="absolute top-16 left-0 right-0 h-1 bg-linear-to-r from-primary via-purple-500 to-pink-500 hidden md:block"
            style={{ width: "calc(100% - 8rem)", left: "4rem" }}
          />

          <div className="grid gap-8 md:grid-cols-3">
            {timeline.map((stage, index) => (
              <div
                key={stage.step}
                className="group relative"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.2}s both`,
                }}
              >
                <div className="relative rounded-3xl border border-border/50 bg-card p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-primary/50">
                  <div className="absolute -top-8 left-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-purple-500 text-white shadow-2xl shadow-primary/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                    <span className="text-2xl font-bold">{stage.step}</span>
                  </div>
                  <div className="mt-12">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      {stage.title}
                    </h3>
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                  <div className="mt-6 h-1 w-0 bg-linear-to-r from-primary to-purple-500 transition-all duration-500 group-hover:w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrapper overflow-hidden rounded-3xl border bg-linear-to-r from-primary/15 via-primary/5 to-primary/20 p-10">
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
              financial and operational excellence.
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
                Explore Institute
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
