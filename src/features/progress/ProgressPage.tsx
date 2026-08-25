import {
  calculateStreak,
  useProgress,
  getCalendarDays,
  useStreakData,
} from "./useProgress";
import { useLeaderBoard } from "./useLeaderBoard";
import { CalendarDays, Flame, Trophy } from "lucide-react";
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
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b8d88]">
          Your journey
        </p>
        <h1 className="font-display mt-2 text-4xl text-[#0f151f]">
          Your progress
        </h1>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-[#75493c] p-5 text-white shadow-lg shadow-[#75493c]/15">
          <Flame size={20} />
          <p className="mt-3 text-4xl font-semibold">{streak}</p>
          <p className="mt-1 text-sm text-white/70">Day streak</p>
        </div>
        <div className="rounded-2xl border border-[#e9e0db] bg-white p-5">
          <CalendarDays size={20} className="text-[#75493c]" />
          <p className="mt-3 text-4xl font-semibold">{totalCompleted}</p>
          <p className="mt-1 text-sm text-[#9b8d88]">Days completed</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#9b8d88]">
          History
        </h2>

        {progress?.length === 0 && (
          <p className="mt-3 text-sm text-gray-500">No complete days yet</p>
        )}

        <ul className="mt-3 space-y-2">
          {progress?.map((entry) => (
            <li
              key={entry.id}
              className="flex justify-between rounded-xl border border-[#e9e0db] bg-white px-4 py-3 text-sm"
            >
              <span>Day {entry.pan_days?.day_number}</span>
              <span className="text-[#9b8d88]">
                {new Date(entry.completed_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            {format(viewedMonth, "MMMM yyyy")}
          </h2>
        </div>

        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="mt-3 grid grid-cols-7 gap-1"
        >
          {calendarDays.map(({ date, isCompleted }) => (
            <div
              key={date.toISOString()}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                isCompleted
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {date.getDate()}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#9b8d88]">
          <Trophy size={16} className="text-[#75493c]" />
          Top streaks
        </h2>

        <ol className="mt-3 space-y-2">
          {leaderboard?.map((entry, index) => (
            <li
              key={index}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
            >
              <span>
                #{index + 1} {entry.profiles?.name ?? entry.profiles?.username}
              </span>
              <span>{entry.current_streak}</span>
            </li>
          ))}
        </ol>
      </div>
    </motion.div>
  );
};
