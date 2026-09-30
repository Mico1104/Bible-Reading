import { BookMarked, BookOpen, Star, TrendingDown } from "lucide-react";
import { useReadingPoints } from "./useReadingPoints";

export const ReadingPointsCard = () => {
  const { data, isLoading, isError } = useReadingPoints();

  if (isLoading) {
    return (
      <div className="mt-7 max-w-3xl rounded-xl border border-(--border) bg-(--surface) p-4">
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
      className="mt-7 max-w-3xl overflow-hidden rounded-xl border border-(--border) bg-(--surface)"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--surface-strong) text-(--primary)">
            <Star size={18} strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--muted)">
              Reading points
            </p>
            <p className="mt-0.5 text-xs text-(--muted-strong)">
              A quiet record of your consistency
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xl font-semibold text-(--text)">
            {data.total.toLocaleString()}
          </p>
          <p className="text-[10px] text-(--muted)">total points</p>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-(--border) border-t border-(--border) bg-(--surface-strong)/60">
        {/* Daily Word */}
        <div className="min-w-0 p-3 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="shrink-0 text-(--primary)" />
            <span className="truncate text-[11px] font-medium text-(--muted-strong)">
              Daily Word
            </span>
          </div>

          <p className="mt-2 text-base font-semibold text-(--text)">
            {data.dailyWord.toLocaleString()}
          </p>
        </div>

        {/* Reading Plans */}
        <div className="min-w-0 p-3 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2">
            <BookMarked size={15} className="shrink-0 text-(--primary)" />
            <span className="truncate text-[11px] font-medium text-(--muted-strong)">
              Plans
            </span>
          </div>

          <p className="mt-2 text-base font-semibold text-(--text)">
            {data.readingPlan.toLocaleString()}
          </p>
        </div>

        {/* Inactivity Adjustments */}
        <div className="min-w-0 p-3 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2">
            <TrendingDown size={15} className="shrink-0 text-(--muted)" />
            <span className="truncate text-[11px] font-medium text-(--muted-strong)">
              Adjustments
            </span>
          </div>

          <p className="mt-2 text-base font-semibold text-(--text)">
            {hasAdjustments ? data.adjustments.toLocaleString() : "0"}
          </p>
        </div>
      </div>
    </section>
  );
};
