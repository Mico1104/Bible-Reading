import { Award, Star, TrendingUp } from "lucide-react";
import {
  getCurrentPointMilestone,
  getNextPointMilestone,
} from "./pointMilestoneConfig";
import { useReadingPoints } from "./useReadingPoints";

export const PointMilestoneCard = () => {
  const { data, isLoading, isError } = useReadingPoints();

  if (isLoading) {
    return (
      <section className="mt-3 max-w-3xl rounded-xl border border-(--border) bg-(--surface) p-4">
        <div className="animate-pulse-soft">
          <div className="skeleton-line h-4 w-36" />
          <div className="skeleton-line mt-4 h-16 w-full" />
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return null;
  }

  const totalPoints = data.total;
  const currentMilestone = getCurrentPointMilestone(totalPoints);
  const nextMilestone = getNextPointMilestone(totalPoints);

  const progressStart = currentMilestone?.minPoints ?? 0;
  const progressEnd = nextMilestone?.minPoints ?? progressStart;
  const pointsInRange = totalPoints - progressStart;
  const rangeSize = progressEnd - progressStart;

  const progressPercentage = nextMilestone
    ? Math.min(
        100,
        Math.max(0, (pointsInRange / rangeSize) * 100),
      )
    : 100;

  return (
    <section
      aria-label="Point milestones"
      className="mt-3 max-w-3xl overflow-hidden rounded-xl border border-(--border) bg-(--surface)"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--surface-strong) text-(--primary)">
            <Award size={19} strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--muted)">
              Point milestones
            </p>
            <p className="mt-0.5 text-xs text-(--muted-strong)">
              Recognition for your reading journey
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold text-(--text)">
            {totalPoints.toLocaleString()}
          </p>
          <p className="text-[10px] text-(--muted)">total points</p>
        </div>
      </div>

      <div className="border-t border-(--border) p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--surface-strong)/60 text-(--primary)">
            {currentMilestone ? (
              <Award size={22} strokeWidth={2} />
            ) : (
              <Star size={22} strokeWidth={2} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-(--text)">
              {currentMilestone?.name ?? "Your journey is underway"}
            </p>

            <p className="mt-1 text-xs leading-5 text-(--muted)">
              {currentMilestone?.description ??
                "Keep reading and completing your readings. Your first point milestone is ahead."}
            </p>
          </div>
        </div>

        {nextMilestone ? (
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-(--text)">
                Next: {nextMilestone.name}
              </p>

              <p className="shrink-0 text-[11px] text-(--muted)">
                {totalPoints.toLocaleString()} /{" "}
                {nextMilestone.minPoints.toLocaleString()}
              </p>
            </div>

            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-(--surface-strong)"
              role="progressbar"
              aria-label="Progress toward next point milestone"
              aria-valuemin={0}
              aria-valuemax={nextMilestone.minPoints}
              aria-valuenow={totalPoints}
            >
              <div
                className="h-full rounded-full bg-(--primary) transition-[width] duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <p className="mt-2 flex items-center gap-1 text-[11px] text-(--muted)">
              <TrendingUp size={13} />
              {(
                nextMilestone.minPoints - totalPoints
              ).toLocaleString()}{" "}
              more points to reach this milestone
            </p>
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-(--border) bg-(--surface-strong)/50 px-3 py-3 text-xs leading-5 text-(--muted-strong)">
            You have reached the highest currently defined point milestone.
            Keep enjoying your reading journey.
          </p>
        )}
      </div>
    </section>
  );
};
