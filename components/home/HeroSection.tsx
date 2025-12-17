"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { APP_NAME } from "@/lib/constants";

type HeroSlide = {
  alt: string;
  src: string;
};

type HighlightStat = {
  label: string;
  value: string;
};

const heroSlides: HeroSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80",
    alt: "Students collaborating with laptops",
  },
  {
    src: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80",
    alt: "Students learning together with tablets",
  },
  {
    src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
    alt: "Teacher guiding students in a classroom",
  },
];

const highlightStats: HighlightStat[] = [
  { label: "Active Learners", value: "3,500+" },
  { label: "Staff Workflows Automated", value: "45+" },
  { label: "Parent Satisfaction", value: "97%" },
  { label: "AI Study Sessions", value: "12k" },
];

const slideDurationMs = 6500;
const slideCount = heroSlides.length;

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const currentSlide = heroSlides[activeIndex % slideCount] ?? heroSlides[0];

  useEffect(() => {
    const totalSlides = slideCount;
    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % totalSlides);
    }, slideDurationMs);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl border bg-slate-950/95 px-10 py-6 text-slate-50">
      <div className="absolute inset-0">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentSlide.src}
            className="absolute inset-0"
            initial={{ opacity: 0.6, scale: 1.04, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.98, x: -20 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
          >
            <Image
              src={currentSlide.src}
              alt={currentSlide.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-30"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/95 to-primary/20" />
      <div className="relative z-10 wrapper flex flex-col gap-10 py-20 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-6">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.3em] text-primary"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Future-Ready Institute
          </motion.div>
          <motion.h1
            className="text-4xl font-semibold leading-tight sm:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            Next-era educational experience with modern comfort zone
          </motion.h1>
          <motion.p
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            {APP_NAME} unifies enrollment, communication, and analytics so your
            team can focus on what matters most student success.
          </motion.p>
          <motion.div
            className="flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
          >
            <Link
              href="/student-registration"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-[1.02]"
            >
              Start Student Registration
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <div className="flex gap-2 pt-2">
            {heroSlides.map((slide, index) => (
              <motion.div
                key={slide.src}
                className="h-1 w-12 overflow-hidden rounded-full bg-white/20"
                initial={false}
                animate={{
                  backgroundColor:
                    activeIndex === index ? "rgba(94, 234, 212, 0.9)" : "rgba(255,255,255,0.2)",
                }}
                transition={{ duration: 0.3 }}
                aria-label={`Slide ${index + 1}`}
              >
                <motion.div
                  className="h-full w-full bg-primary"
                  initial={false}
                  animate={{
                    scaleX: activeIndex === index ? 1 : 0,
                    transformOrigin: "left",
                  }}
                  transition={{
                    duration: activeIndex === index ? slideDurationMs / 1000 : 0.3,
                    ease: "linear",
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div
          className="grid w-full max-w-sm grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 backdrop-blur"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35 }}
        >
          {highlightStats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {stat.label}
              </p>
              <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
