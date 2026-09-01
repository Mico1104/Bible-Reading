import { useAuthStore } from "@/stores/authStore";
import { Navigate, Link } from "react-router-dom";
import { ArrowRight, BookOpen, Check, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

export const LandingPage = () => {
  const user = useAuthStore((state) => state.user);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Array of reading images (reading1-reading10, plus landing image)
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <motion.div
      className="page-shell overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="content-width grid items-center gap-12 py-10 sm:py-16 lg:grid-cols-[1fr_0.9fr] lg:gap-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-(--surface-muted) px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-(--primary)">
            <BookOpen size={14} /> A plan that fits your life
          </div>
          <h1 className="font-display max-w-xl text-4xl leading-[1.08] text-(--text) sm:text-6xl">
            One to five chapters. One faithful rhythm.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-(--muted-strong) sm:text-lg">
            Choose how much you read each day and whether you begin in the Old
            Testament or New Testament. Read with intention, remember what
            speaks to you, and build a faithful rhythm that lasts.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--primary) px-6 py-3 font-semibold text-white transition hover:bg-(--primary-strong)"
            >
              Begin your reading <ArrowRight size={18} />
            </Link>
          </div>
          <p className="mt-5 text-sm text-(--muted)">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-(--primary) underline underline-offset-4"
            >
              Log in
            </Link>
          </p>
        </motion.div>
        <motion.div
          className="relative h-[600px] w-full"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.18 }}
        >
          <div className="relative h-full w-full overflow-visible">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt="Bible reading inspiration"
                className="h-full w-full rounded-4xl object-cover shadow-[0_20px_45px_rgba(117,73,60,0.18)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              />
            </AnimatePresence>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? "w-6 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:bottom-auto lg:top-0 lg:translate-y-1/2 lg:-right-12 lg:left-auto lg:translate-x-0 flex items-center gap-3 rounded-xl bg-(--surface) p-4 shadow-xl z-20">
            <span className="rounded-full bg-(--surface-muted) p-2 text-(--primary) flex-shrink-0">
              <Flame size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-(--muted) whitespace-nowrap">
                Your next habit
              </p>
              <p className="font-semibold text-(--text) leading-snug">
                One faithful day at a time
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="content-width grid gap-4 border-t border-(--border) py-8 sm:grid-cols-3">
        {[
          "Choose 1–5 chapters each day",
          "Start in the Old or New Testament",
          "Keep your reading streak",
          "Save the verses that stay",
        ].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 text-sm font-medium text-(--muted-strong)"
          >
            <span className="rounded-full bg-[#dce8df] p-1 text-[#4c765d]">
              <Check size={14} />
            </span>
            {item}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
