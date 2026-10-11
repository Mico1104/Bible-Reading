import { useState } from "react";
import {
  Award,
  BookCheck,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  Star,
} from "lucide-react";
import {
  useReadingPlanHistory,
  type ReadingPlanHistoryItem,
} from "./useReadingPlanHistory";

export const ReadingPlanHistoryCard = () => {
  const { data, isLoading, isError } = useReadingPlanHistory();
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <section
      aria-label="Reading Plan history"
      className="mt-3 max-w-3xl overflow-hidden rounded-xl border border-(--border) bg-(--surface)"
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-(--surface-strong) sm:px-5"
        aria-expanded={isOpen}
        aria-controls="reading-plan-history-content"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--surface-strong) text-(--primary)">
            <BookCheck size={19} />
          </span>

          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-(--muted)">
              Your journey
            </span>

            <span className="mt-0.5 block text-sm font-semibold text-(--text)">
              Reading Plan History
            </span>

            <span className="mt-0.5 block text-xs text-(--muted-strong)">
              {data.length === 0
                ? "Your completed plans will appear here"
                : `${data.length} completed ${data.length === 1 ? "plan" : "plans"}`}
            </span>
          </span>
        </span>

        {isOpen ? (
          <ChevronUp size={17} className="shrink-0" />
        ) : (
          <ChevronDown size={17} className="shrink-0" />
        )}
      </button>

      {isOpen && (
        <div
          id="reading-plan-history-content"
          className="border-t border-(--border)"
        >
          {data.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--surface-strong) text-(--muted)">
                <BookOpen size={20} />
              </div>

              <p className="mt-3 text-sm font-medium text-(--text)">
                Your reading journey is just beginning
              </p>

              <p className="mt-1 max-w-xs text-xs leading-5 text-(--muted)">
                When you complete a Reading Plan, its history and
                achievements will be saved here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-(--border)">
              {data.map((plan: ReadingPlanHistoryItem) => (
                <article
                  key={plan.userPlanId}
                  className="px-4 py-4 sm:px-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-(--border) bg-(--surface-strong)/60 text-(--primary)">
                      <Award size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-(--text)">
                        {plan.title}
                      </h3>

                      <p className="mt-1 text-xs text-(--muted)">
                        Completed Reading Plan
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3">
                        <div>
                          <p className="flex items-center gap-1 text-[10px] text-(--muted)">
                            <CalendarDays size={12} />
                            Started
                          </p>

                          <p className="mt-1 text-xs font-medium text-(--text)">
                            {new Date(
                              `${plan.startDate}T00:00:00`,
                            ).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <div>
                          <p className="flex items-center gap-1 text-[10px] text-(--muted)">
                            <Clock3 size={12} />
                            Completed
                          </p>

                          <p className="mt-1 text-xs font-medium text-(--text)">
                            {plan.completionDate
                              ? new Date(
                                  plan.completionDate,
                                ).toLocaleDateString(undefined, {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Date unavailable"}
                          </p>
                        </div>

                        <div>
                          <p className="flex items-center gap-1 text-[10px] text-(--muted)">
                            <BookCheck size={12} />
                            Reading days
                          </p>

                          <p className="mt-1 text-xs font-medium text-(--text)">
                            {plan.completedDays} of {plan.durationDays}
                          </p>
                        </div>

                        <div>
                          <p className="flex items-center gap-1 text-[10px] text-(--muted)">
                            <Star size={12} />
                            Points earned
                          </p>

                          <p className="mt-1 text-xs font-semibold text-(--primary)">
                            +{plan.pointsEarned.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 inline-flex items-center gap-1 rounded-md border border-(--border) px-2 py-1 text-[10px] font-semibold text-(--success)">
                        <Award size={12} />
                        Completed
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
