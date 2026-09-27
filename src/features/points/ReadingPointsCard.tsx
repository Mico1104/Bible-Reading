import {
  BookMarked,
  BookOpen,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useReadingPoints } from "./useReadingPoints";

export const ReadingPointsCard = () => {
  const { data, isLoading, isError } = useReadingPoints();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-sm">
        <div className="animate-pulse-soft">
          <div className="skeleton-line h-4 w-32" />
          <div className="skeleton-line mt-4 h-9 w-24" />
          <div className="skeleton-line mt-5 h-3 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  const hasAdjustments = data.adjustments !== 0;

  return (
    <section
      aria-label="Reading points"
      className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface) shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--surface-strong) text-(--primary)">
            <Star size={21} strokeWidth={2} />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--muted)">
              Reading achievement
            </p>

            <h2 className="mt-1 text-base font-semibold text-(--text)">
              Your Reading Points
            </h2>

            <p className="mt-1 text-xs leading-5 text-(--muted)">
              Keep building your reading habit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-(--surface-strong) px-2.5 py-1.5 text-xs font-semibold text-(--primary)">
          <TrendingUp size={13} />
          Growing
        </div>
      </div>

      {/* Total points */}
      <div className="border-y border-(--border) bg-(--surface-strong) px-5 py-5 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-bold tracking-tight text-(--text)">
              {data.total.toLocaleString()}
            </p>

            <p className="mt-1 text-xs font-medium text-(--muted)">
              current points
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--surface) text-(--primary)">
            <Sparkles size={18} />
          </div>
        </div>
      </div>

      {/* Point breakdown */}
      <div className="grid grid-cols-2 divide-x divide-(--border) sm:grid-cols-3">
        {/* Daily Word */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--surface-strong) text-(--primary)">
              <BookOpen size={16} />
            </div>

            <span className="text-xs font-medium text-(--muted)">
              Daily Word
            </span>
          </div>

          <p className="mt-3 text-lg font-bold text-(--text)">
            {data.dailyWord.toLocaleString()}
          </p>

          <p className="mt-0.5 text-[11px] text-(--muted)">
            points earned
          </p>
        </div>

        {/* Reading Plans */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--surface-strong) text-(--primary)">
              <BookMarked size={16} />
            </div>

            <span className="text-xs font-medium text-(--muted)">
              Reading Plans
            </span>
          </div>

          <p className="mt-3 text-lg font-bold text-(--text)">
            {data.readingPlan.toLocaleString()}
          </p>

          <p className="mt-0.5 text-[11px] text-(--muted)">
            points earned
          </p>
        </div>

        {/* Inactivity Adjustments */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--surface-strong) text-(--muted)">
              <TrendingDown size={16} />
            </div>

            <span className="text-xs font-medium text-(--muted)">
              Adjustments
            </span>
          </div>

          <p className="mt-3 text-lg font-bold text-(--text)">
            {hasAdjustments
              ? data.adjustments.toLocaleString()
              : "0"}
          </p>

          <p className="mt-0.5 text-[11px] text-(--muted)">
            inactivity
          </p>
        </div>
      </div>
    </section>
  );
};