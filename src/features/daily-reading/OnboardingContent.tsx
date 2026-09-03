import { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, BookText, Sparkles } from "lucide-react";
import { useCreatePlan } from "./useCreatePlan";

export const OnboardingContent = () => {
  const createPlan = useCreatePlan();
  const [chaptersPerDay, setChaptersPerDay] = useState(2);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [reminderTime, setReminderTime] = useState("");

  const handleStart = (testament: "OT" | "NT") => {
    createPlan.mutate({
      testament,
      chaptersPerDay,
      startDate,
      reminderTime: reminderTime || null,
    });
  };

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
          Set up your Bible reading
        </h1>
        <p className="max-w-xl text-sm leading-6 text-(--muted-strong) sm:text-base">
          Choose your pace and pick the starting point, and (optionally) a daily
          reminder. You'll move through the text in order and loop back around
          once you finish.
        </p>
      </div>

      <div className="rounded-2xl border border-(--border) bg-(--surface-strong) p-4 sm:p-5">
        <label className="block text-sm font-medium text-(--muted-strong)">
          Chapters per day
        </label>
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5">
          <BookText size={18} className="text-(--primary)" />
          <select
            value={chaptersPerDay}
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
        <div>
          <label className="text-sm text-[#7e6862]">Start date</label>
          <input
            type="date"
            value={startDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-[#7e6862]">
            Daily reminder time (optional)
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
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
            className="group flex items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border(--primary) hover:bg-(--surface-strong) disabled:cursor-not-allowed disabled:opacity-60"
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
            className="group flex items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border(--primary) hover:bg-(--surface-strong) disabled:cursor-not-allowed disabled:opacity-60"
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
