import { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, BookText, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useCreatePlan } from "./useCreatePlan";
import { useProfile } from "../auth/useProfile";
import { useAuthStore } from "@/stores/authStore";

export const OnboardingContent = () => {
  const createPlan = useCreatePlan();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const user = useAuthStore((state) => state.user);

  const isGoogleUser = user?.app_metadata?.provider === "google";

  const [name, setName] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [chaptersPerDay, setChaptersPerDay] = useState<number | null>(null);
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const currentName = name ?? profile?.name ?? "";
  const currentUsername = username ?? profile?.username ?? "";
  const currentChaptersPerDay =
    chaptersPerDay ?? profile?.chapters_per_day ?? 2;
  const currentReminderTime = reminderTime ?? profile?.reminder_time ?? "";

  const handleStart = (testament: "OT" | "NT") => {
    if (isGoogleUser) {
      if (!currentName.trim()) {
        toast.error("Please enter your name.");
        return;
      }

      if (!currentUsername.trim()) {
        toast.error("Please enter a username.");
        return;
      }
    }

    createPlan.mutate({
      ...(isGoogleUser
        ? {
            name: currentName,
            username: currentUsername,
          }
        : {}),
      testament,
      chaptersPerDay: currentChaptersPerDay,
      startDate,
      reminderTime: currentReminderTime || null,
    });
  };

  const today = new Date().toISOString().slice(0, 10);

  if (profileLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <p className="text-sm text-(--muted-strong)">
          Preparing your profile...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-strong) px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-(--primary)">
          <Sparkles size={12} />
          New plan
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="font-display text-3xl leading-tight text-(--text) sm:text-4xl">
          {isGoogleUser ? "Welcome to Daily Word" : "Set up your Bible reading"}
        </h1>

        <p className="max-w-xl text-sm leading-6 text-(--muted-strong) sm:text-base">
          {isGoogleUser
            ? "Confirm your profile details, then choose how you want to begin your Bible reading journey."
            : "Choose your pace and pick the starting point, and (optionally) a daily reminder. You'll move through the text in order and loop back around once you finish."}
        </p>
      </div>

      {isGoogleUser && (
        <div className="rounded-2xl border border-(--border) bg-(--surface-strong) p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserRound size={18} className="text-(--primary)" />

            <h2 className="font-semibold text-(--text)">
              Your profile
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="onboarding-name"
                className="block text-sm font-medium text-(--muted-strong)"
              >
                Name
              </label>

              <input
                id="onboarding-name"
                type="text"
                value={currentName}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="mt-2 w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5 text-sm text-(--text) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20"
              />
            </div>

            <div>
              <label
                htmlFor="onboarding-username"
                className="block text-sm font-medium text-(--muted-strong)"
              >
                Username
              </label>

              <input
                id="onboarding-username"
                type="text"
                value={currentUsername}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                autoComplete="username"
                className="mt-2 w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5 text-sm text-(--text) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20"
              />

              <p className="mt-1.5 text-xs text-(--muted)">
                This is the name other Daily Word users will see.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-(--border) bg-(--surface-strong) p-4 sm:p-5">
        <label className="block text-sm font-medium text-(--muted-strong)">
          Chapters per day
        </label>

        <div className="mt-2 flex items-center gap-3 rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5">
          <BookText size={18} className="text-(--primary)" />

          <select
            value={currentChaptersPerDay}
            onChange={(e) => setChaptersPerDay(Number(e.target.value))}
            className="w-full bg-transparent text-sm font-medium text-(--text) outline-none"
            aria-label="Chapters per day"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} chapters a day
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label
            htmlFor="start-date"
            className="block text-sm font-medium text-(--muted-strong)"
          >
            Start date
          </label>

          <input
            id="start-date"
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5 text-sm text-(--text) outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20"
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="reminder-time"
            className="block text-sm font-medium text-(--muted-strong)"
          >
            Daily reminder time
            <span className="ml-1 font-normal text-(--muted)">
              (optional)
            </span>
          </label>

          <input
            id="reminder-time"
            type="time"
            value={currentReminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="mt-2 w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5 text-sm text-(--text) outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20"
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--muted)">
          Begin with
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleStart("OT")}
            disabled={createPlan.isPending}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-(--primary) hover:bg-(--surface-strong) disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-(--muted)">
                Start here
              </span>

              <span className="mt-1 block font-display text-xl text-(--text)">
                Old Testament
              </span>
            </span>

            <BookOpen
              size={18}
              className="text-(--primary) transition group-hover:translate-x-0.5"
            />
          </button>

          <button
            type="button"
            onClick={() => handleStart("NT")}
            disabled={createPlan.isPending}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-(--primary) hover:bg-(--surface-strong) disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-(--muted)">
                Start here
              </span>

              <span className="mt-1 block font-display text-xl text-(--text)">
                New Testament
              </span>
            </span>

            <BookOpen
              size={18}
              className="text-(--primary) transition group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
};