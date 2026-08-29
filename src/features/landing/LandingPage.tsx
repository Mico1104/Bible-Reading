import { useAuthStore } from "@/stores/authStore";
import { Navigate, Link } from "react-router-dom";
import { ArrowRight, BookOpen, Check, Flame } from "lucide-react";
import { motion } from "motion/react";

export const LandingPage = () => {
  const user = useAuthStore((state) => state.user);

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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-(--primary)">
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
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-(--primary-strong)"
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
          className="relative"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.18 }}
        >
          <img
            src="/landingImage.jpg"
            alt="Open Bible in warm morning light"
            className="aspect-4/5 w-full rounded-[2rem] object-cover shadow-[0_20px_45px_rgba(117,73,60,0.18)] sm:aspect-5/4 lg:aspect-4/5"
          />
          <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-xl bg-(--surface) p-4 shadow-xl sm:-left-6">
            <span className="rounded-full bg-[var(--surface-muted)] p-2 text-(--primary)">
              <Flame size={18} />
            </span>
            <div>
              <p className="text-xs text-(--muted)">Your next habit</p>
              <p className="font-semibold text-(--text)">
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
