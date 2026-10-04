import { Award, BookCheck } from "lucide-react";
import { useCompletedReadingPlans } from "../reading-plans/useCompleteReadingPlans";

export const ReadingPlanBadgeCard = () => {
  const { data, isLoading, isError } = useCompletedReadingPlans();

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

  const completedPlans = data.filter(
    (plan) => plan.isCompleted,
  );

  if (completedPlans.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Reading Plan completion badges"
      className="mt-3 max-w-3xl overflow-hidden rounded-xl border border-(--border) bg-(--surface)"
    >
      <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--surface-strong) text-(--primary)">
          <Award size={19} strokeWidth={2} />
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--muted)">
            Earned badges
          </p>

          <p className="mt-0.5 text-xs text-(--muted-strong)">
            Reading Plans you have completed
          </p>
        </div>
      </div>

      <div className="border-t border-(--border)">
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
          {completedPlans.map((plan) => (
            <div
              key={`${plan.planId}-${plan.slug}`}
              className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--surface-strong)/50 p-3"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--surface) text-(--primary)">
                <BookCheck size={21} strokeWidth={2} />

                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-(--surface) text-(--success)"
                >
                  <Award size={11} strokeWidth={2.5} />
                </span>
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-(--text)">
                  {plan.title}
                </p>

                <p className="mt-0.5 text-[11px] text-(--muted)">
                  Completed · {plan.durationDays} days
                </p>

                <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-(--primary)">
                  <BookCheck size={11} />
                  Plan badge earned
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
