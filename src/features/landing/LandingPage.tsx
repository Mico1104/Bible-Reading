import { useAuthStore } from "@/stores/authStore";
import { Navigate, Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  Flame,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const images = [
  "/landingImage.jpg",
  "/reading1.jpg",
  "/reading2.jpg",
  "/reading3.jpg",
  "/reading4.jpg",
  "/reading5.jpg",
  "/reading6.jpg",
  "/reading7.jpg",
  "/reading8.jpg",
  "/reading9.jpg",
  "/reading10.jpg",
];

const features = [
  "Choose 1–5 chapters each day",
  "Start in the Old or New Testament",
  "Keep your reading streak",
  "Save the verses that stay",
];

export const LandingPage = () => {
  const user = useAuthStore((state) => state.user);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  const previousImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + images.length) % images.length,
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <motion.div
      className="page-shell overflow-hidden"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero */}
      <div className="content-width grid items-center gap-10 py-8 sm:gap-12 sm:py-14 lg:grid-cols-[1fr_0.9fr] lg:gap-20 lg:py-20">
        {/* Hero copy */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
        >
          <motion.div
            className="mb-5 inline-flex items-center gap-2 rounded-full bg-(--surface-muted) px-3.5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-(--primary) sm:mb-6"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <BookOpen size={14} />
            A plan that fits your life
          </motion.div>

          <h1 className="font-display max-w-2xl text-4xl leading-[1.06] tracking-tight text-(--text) sm:text-5xl lg:text-6xl">
            One to five chapters.
            <span className="block text-(--primary)">
              One faithful rhythm.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-(--muted-strong) sm:mt-6 sm:text-lg sm:leading-8">
            Choose how much you read each day and whether you begin in the Old
            Testament or New Testament. Read with intention, remember what
            speaks to you, and build a faithful rhythm that lasts.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <Link
              to="/signup"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-(--primary) px-6 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--primary-strong) hover:shadow-md active:translate-y-0"
            >
              Begin your reading
              <ArrowRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>

          <p className="mt-4 text-sm text-(--muted)">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-(--primary) underline decoration-(--primary)/40 underline-offset-4 transition-colors hover:text-(--primary-strong)"
            >
              Log in
            </Link>
          </p>
        </motion.div>

        {/* Image showcase */}
        <motion.div
          className="relative mx-auto h-[28rem] w-full max-w-xl sm:h-[34rem] lg:h-[38rem]"
          initial={
            shouldReduceMotion ? false : { opacity: 0, scale: 0.97, y: 12 }
          }
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12 }}
        >
          <div className="relative h-full w-full">
            <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-4xl bg-(--surface-muted) sm:translate-x-3 sm:translate-y-3" />

            <div className="relative h-full w-full overflow-hidden rounded-4xl shadow-[0_20px_45px_rgba(117,73,60,0.18)]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={`Bible reading inspiration ${currentImageIndex + 1}`}
                  className="h-full w-full object-cover"
                  initial={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 0, scale: 1.025 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.99 }
                  }
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </AnimatePresence>

              {/* Image controls */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-linear-to-t from-black/35 via-black/5 to-transparent p-4 pt-16 sm:p-5 sm:pt-20">
                <button
                  type="button"
                  onClick={previousImage}
                  aria-label="Previous image"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-(--text) shadow-sm backdrop-blur transition-transform hover:scale-105 active:scale-95"
                >
                  <ChevronLeft size={18} />
                </button>

                <div
                  className="flex items-center gap-1.5"
                  aria-label={`Image ${currentImageIndex + 1} of ${images.length}`}
                >
                  {images.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`Go to image ${index + 1}`}
                      aria-current={
                        index === currentImageIndex ? "true" : undefined
                      }
                      className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? "w-6 bg-white"
                          : "w-1.5 bg-white/55 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Next image"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-(--text) shadow-sm backdrop-blur transition-transform hover:scale-105 active:scale-95"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Habit card */}
          <motion.div
            className="absolute -bottom-5 left-1/2 flex w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 items-center gap-3 rounded-2xl bg-(--surface) p-3.5 shadow-xl sm:-bottom-6 sm:left-auto sm:right-0 sm:w-auto sm:max-w-sm sm:translate-x-0 sm:p-4 lg:-right-10 lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    y: [0, -5, 0],
                  }
            }
            transition={
              shouldReduceMotion
                ? undefined
                : {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--surface-muted) text-(--primary)">
              <Flame size={18} />
            </span>

            <div className="min-w-0">
              <p className="text-xs text-(--muted)">Your next habit</p>
              <p className="mt-0.5 text-sm font-semibold leading-snug text-(--text) sm:text-base">
                One faithful day at a time
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Feature strip */}
      <div className="content-width border-t border-(--border) py-7 sm:py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {features.map((item, index) => (
            <motion.div
              key={item}
              className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-(--muted-strong)"
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 10 }
              }
              whileInView={
                shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
              }
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.4,
                delay: index * 0.06,
              }}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dce8df] text-[#4c765d]">
                <Check size={14} />
              </span>

              <span>{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};