import {
  calculateStreak,
  useProgress,
  getCalendarDays,
  useStreakData,
} from "./useProgress";
import { useLeaderBoard } from "./useLeaderBoard";
import {
  CalendarDays,
  Flame,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { motion } from "motion/react";
import { subMonths, addMonths, format } from "date-fns";
import { useState } from "react";

export const ProgressPage = () => {
  const { data: progress, isLoading, error } = useProgress();
  const { data: streakData } = useStreakData();
  const [viewedMonth, setViewedMonth] = useState(new Date());

  const streak = calculateStreak(streakData);
  const calendarDays = getCalendarDays(viewedMonth, streakData);
  const { data: leaderboard } = useLeaderBoard();

  const goToPreviousMonth = () => setViewedMonth((prev) => subMonths(prev, 1));
  const goToNextMonth = () => setViewedMonth((prev) => addMonths(prev, 1));

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } },
  ) => {
    if (info.offset.x < -80) goToNextMonth();
    if (info.offset.x > 80) goToPreviousMonth();
  };

  if (isLoading) {
    return (
      <motion.div
        className="content-width page-shell flex flex-col items-center justify-center gap-4 py-12 text-center text-[#9b8d88]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eadbd5]">
          <LoaderCircle className="animate-spin text-[#75493c]" size={22} />
        </div>
        <div>
          <p className="font-display text-2xl text-[#0f151f]">
            Gathering your journey
          </p>
          <p className="mt-1 text-sm">Loading your progress...</p>
        </div>
      </motion.div>
    );
  }

  const totalCompleted = progress?.length ?? 0;

  if (error) {
    return (
      <motion.div
        className="content-width page-shell py-8 sm:py-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-xl rounded-2xl border border-[#eadbd5] bg-white p-6 text-[#75493c] shadow-sm sm:p-8">
          <AlertCircle size={22} />
          <h1 className="font-display mt-4 text-3xl text-[#0f151f]">
            Your progress is taking a pause
          </h1>
          <p className="mt-3 leading-7 text-[#7e6862]">
            We couldn't load your history. Please refresh and try again.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="content-width page-shell py-8 sm:py-12"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--muted)">
          Your journey
        </p>
        <h1 className="font-display mt-2 text-3xl text-(--text) sm:text-4xl">
          Your progress
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-3xl bg-[#75493c] p-4 text-white shadow-lg shadow-[#75493c]/15 sm:p-5">
          <Flame size={18} />
          <p className="mt-3 text-3xl font-semibold sm:text-4xl">{streak}</p>
          <p className="mt-1 text-xs text-white/70 sm:text-sm">Day streak</p>
        </div>
        <div className="rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm sm:p-5">
          <CalendarDays size={18} className="text-(--primary)" />
          <p className="mt-3 text-3xl font-semibold text-(--text) sm:text-4xl">
            {totalCompleted}
          </p>
          <p className="mt-1 text-xs text-(--muted-strong) sm:text-sm">
            Days completed
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm sm:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-(--muted-strong)">
          History
        </h2>

        {progress?.length === 0 && (
          <p className="mt-3 text-sm text-(--muted)">No complete days yet</p>
        )}

        <ul className="mt-3 space-y-2">
          {progress?.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-(--border) bg-(--surface-strong) px-4 py-3 text-sm text-(--muted-strong)"
            >
              <span className="font-medium">
                Day {entry.pan_days?.day_number}
              </span>
              <span className="text-(--muted)">
                {new Date(entry.completed_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            onClick={goToPreviousMonth}
            className="inline-flex items-center justify-center rounded-lg p-2 text-(--muted-strong) transition hover:bg-(--surface-strong) hover:text-(--primary) sm:px-3"
            aria-label="Previous month"
            title="Previous month"
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className="flex-1 text-center text-sm font-semibold uppercase tracking-wide text-(--muted-strong)">
            {format(viewedMonth, "MMMM yyyy")}
          </h2>

          <button
            onClick={goToNextMonth}
            className="inline-flex items-center justify-center rounded-lg p-2 text-(--muted-strong) transition hover:bg-(--surface-strong) hover:text-(--primary) sm:px-3"
            aria-label="Next month"
            title="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="relative">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="mt-3 grid grid-cols-7 gap-2 cursor-grab active:cursor-grabbing"
          >
            {calendarDays.map(({ date, isCompleted }) => (
              <div
                key={date.toISOString()}
                className="flex flex-col items-center gap-1"
              >
                <div className="text-[10px] font-medium uppercase tracking-wide text-(--muted)">
                  {date
                    .toLocaleDateString("en", { weekday: "short" })
                    .charAt(0)}
                </div>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    isCompleted
                      ? "bg-(--primary) text-white shadow-sm"
                      : "bg-(--surface-muted) text-(--muted)"
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
            ))}
          </motion.div>

          <div className="mt-4 flex justify-center gap-2 sm:hidden">
            <div className="flex items-center gap-2 text-xs text-(--muted)">
              <ChevronLeft size={14} />
              <span>Swipe</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-(--muted-strong)">
          <Trophy size={16} className="text-(--primary)" />
          Top streaks
        </h2>

        <ol className="mt-3 space-y-2">
          {leaderboard?.map((entry, index) => (
            <li
              key={index}
              className="flex items-center justify-between rounded-xl border border-(--border) bg-(--surface-strong) px-4 py-3 text-sm text-(--muted-strong)"
            >
              <span className="font-medium">
                #{index + 1} {entry.profiles?.name ?? entry.profiles?.username}
              </span>
              <span className="text-(--muted)">{entry.current_streak}</span>
            </li>
          ))}
        </ol>
      </div>
    </motion.div>
  );
};
