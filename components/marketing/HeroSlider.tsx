"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { APP_NAME } from "@/lib/constants";

const slides = [
  {
    id: 1,
    title: "Next-Era Educational Experience",
    subtitle: "Modern Comfort Zone",
    description: `${APP_NAME} unifies enrollment, communication, and analytics so your team can focus on what matters most student success.`,
    image: "/images/showcase/hero-education.jpg",
    ctaText: "Start Registration",
    ctaLink: "/student-registration",
    accentParams: {
      label: "Future-Ready",
      icon: Sparkles,
      color: "text-amber-400",
    },
  },
  {
    id: 2,
    title: "Empowering Every Learner",
    subtitle: "Unlock Potential",
    description:
      "Our modern learning paths and AI-driven insights ensure every student achieves their academic goals.",
    image: "/images/showcase/learning-environment.jpg",
    ctaText: "Explore Courses",
    ctaLink: "/courses",
    accentParams: {
      label: "Excellence",
      icon: GraduationCap,
      color: "text-blue-400",
    },
  },
  {
    id: 3,
    title: "Seamless Institute Management",
    subtitle: "Digital Transformation",
    description:
      "Streamline operations with our integrated EIMS, Learning content management.",
    image: "/images/showcase/digital-technology.jpg",
    ctaText: "View Gallery",
    ctaLink: "/gallery",
    accentParams: {
      label: "Efficiency",
      icon: BookOpen,
      color: "text-emerald-400",
    },
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [current]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + slides.length) % slides.length);
  };

  const nextSlide = () => paginate(1);
  const prevSlide = () => paginate(-1);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.1,
    }),
  };

  const textVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="relative h-[650px] w-full overflow-hidden rounded-3xl border border-border/40 shadow-2xl">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
            scale: { duration: 0.6 },
          }}
          className="absolute inset-0 h-full w-full bg-slate-900"
        >
          <Image
            src={slides[current].image}
            alt={slides[current].title}
            fill
            priority
            className="object-cover opacity-60"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-slate-950/90 via-slate-950/60 to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex h-full items-center px-8 md:px-16 lg:px-24">
            <div className="max-w-3xl space-y-6">
              <motion.div
                variants={textVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium uppercase tracking-[0.2em] backdrop-blur-md"
              >
                <div
                  className={`rounded-full bg-current p-1 ${slides[current].accentParams.color}`}
                ></div>
                <span className={slides[current].accentParams.color}>
                  {slides[current].accentParams.label}
                </span>
              </motion.div>

              <div className="space-y-2">
                <motion.p
                  variants={textVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-2xl font-light text-slate-300 md:text-3xl"
                >
                  {slides[current].subtitle}
                </motion.p>
                <motion.h1
                  variants={textVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-7xl"
                >
                  <span className="bg-linear-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                    {slides[current].title}
                  </span>
                </motion.h1>
              </div>

              <motion.p
                variants={textVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.5, duration: 0.5 }}
                className="max-w-xl text-lg text-slate-300"
              >
                {slides[current].description}
              </motion.p>

              <motion.div
                variants={textVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                <Link
                  href={slides[current].ctaLink}
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-primary/40"
                >
                  {slides[current].ctaText}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-10 right-10 z-20 flex gap-3">
        <button
          onClick={prevSlide}
          className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white backdrop-blur-md transition-all hover:bg-primary hover:text-white"
        >
          <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-0.5" />
        </button>
        <button
          onClick={nextSlide}
          className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white backdrop-blur-md transition-all hover:bg-primary hover:text-white"
        >
          <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-10 left-10 z-20 flex gap-2 md:left-1/2 md:-translate-x-1/2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > current ? 1 : -1);
              setCurrent(index);
            }}
            className={`h-1.5 transition-all duration-300 rounded-full ${
              index === current
                ? "w-8 bg-primary"
                : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
