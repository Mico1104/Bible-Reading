import { CalendarDays } from "lucide-react";
import { useWeeklyBadge } from "./useWeeklyBadge";

export const WeeklyBadgeCard = () => {
  const { data, isLoading, isError } = useWeeklyBadge();

  if (isLoading) {
    return (
      <section className="mt-5 max-w-3xl rounded-2xl border border-(--border) bg-(--surface) p-4">
        <div className="animate-pulse-soft">
          <div className="skeleton-line h-4 w-28" />
          <div className="skeleton-line mt-4 h-10 w-48" />
          <div className="skeleton-line mt-4 h-3 w-full" />
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return null;
  }

  const BadgeIcon = data.badge?.icon ?? CalendarDays;

  const progressTarget = data.nextBadge?.minDays ?? 7;

  const progress = Math.min(
    100,
    Math.round(
      (data.activeDays / progressTarget) * 100,
    ),
  );

  return (
    <section
      aria-label="Weekly reading badge"
      className="mt-5 max-w-3xl overflow-hidden rounded-2xl border border-(--border) bg-(--surface)"
    >
      <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--surface-strong) text-(--primary)">
            <BadgeIcon
              size={20}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--muted)">
              This week's badge
            </p>

            <p className="mt-1 text-sm font-semibold text-(--text)">
              {data.badge?.name ?? "Build your week"}
            </p>

            <p className="mt-0.5 text-xs text-(--muted)">
              {data.badge
                ? data.badge.description
                : "Read on three different days to earn your first weekly badge."}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold text-(--text)">
            {data.activeDays}/7
          </p>

          <p className="text-[10px] text-(--muted)">
            active days
          </p>
        </div>
      </div>

      <div className="border-t border-(--border) bg-(--surface-strong)/60 px-4 py-3.5 sm:px-5">
        <div className="flex items-center justify-between gap-3 text-[11px]">
          <span className="text-(--muted)">
            {data.nextBadge
              ? `${data.nextBadge.minDays - data.activeDays} more day${
                  data.nextBadge.minDays -
                    data.activeDays ===
                  1
                    ? ""
                    : "s"
                } to ${data.nextBadge.name}`
              : "You've completed the weekly badge path."}
          </span>

          <span className="font-semibold text-(--muted-strong)">
            {data.activeDays} day
            {data.activeDays === 1 ? "" : "s"}
          </span>
        </div>

        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--surface)"
          role="progressbar"
          aria-valuenow={data.activeDays}
          aria-valuemin={0}
          aria-valuemax={progressTarget}
          aria-label="Weekly reading progress"
        >
          <div
            className="h-full rounded-full bg-(--primary) transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
};