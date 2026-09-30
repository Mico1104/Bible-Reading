import { useState } from "react";
import {
  BookMarked,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock3,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { usePointsHistory } from "./usePointsHistory";

export const PointsHistory = () => {
  const { data, isLoading, isError } = usePointsHistory();
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <section className="mt-3 max-w-3xl rounded-xl border border-(--border) bg-(--surface) p-4">
        <div className="animate-pulse-soft">
          <div className="skeleton-line h-4 w-32" />
          <div className="skeleton-line mt-4 h-5 w-48" />

          <div className="mt-6 space-y-4">
            <div className="skeleton-line h-12 w-full" />
            <div className="skeleton-line h-12 w-full" />
            <div className="skeleton-line h-12 w-full" />
          </div>
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return null;
  }

  const hasMore = data.length > 5;
  const visibleItems = showAll ? data : data.slice(0, 5);

  return (
    <section
      aria-label="Points history"
      className="mt-3 max-w-3xl overflow-hidden rounded-xl border border-(--border) bg-(--surface)"
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-(--surface-strong)"
        aria-expanded={isOpen}
        aria-controls="points-history-content"
      >
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-(--muted)">
            Activity
          </span>
          <span className="mt-0.5 block text-sm font-semibold text-(--text)">
            Points history
          </span>
        </span>
        {isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
      </button>

      {isOpen && (
        <div id="points-history-content" className="border-t border-(--border)">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--surface-strong) text-(--muted)">
                <Clock3 size={20} />
              </div>

              <p className="mt-3 text-sm font-medium text-(--text)">
                No points activity yet
              </p>

              <p className="mt-1 max-w-xs text-xs leading-5 text-(--muted)">
                Complete your Daily Word or a Reading Plan day to start earning
                points.
              </p>
            </div>
          ) : (
            <>
              {/* History list */}
              <div
                className={
                  showAll ? "max-h-80 overflow-y-auto overscroll-contain" : ""
                }
              >
                <div className="divide-y divide-(--border)">
                  {visibleItems.map((item) => {
                    const isAdjustment = item.type === "adjustment";
                    const isDailyWord = item.activityType === "daily_word";

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--surface-strong) text-(--muted)">
                            {isAdjustment ? (
                              <TrendingDown size={17} />
                            ) : isDailyWord ? (
                              <BookOpen size={17} />
                            ) : (
                              <BookMarked size={17} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-(--text)">
                              {item.reason}
                            </p>

                            <p className="mt-0.5 text-[11px] text-(--muted)">
                              {new Date(item.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`flex shrink-0 items-center gap-1 text-sm font-bold ${
                            isAdjustment ? "text-(--muted)" : "text-(--primary)"
                          }`}
                        >
                          {isAdjustment ? (
                            <TrendingDown size={14} />
                          ) : (
                            <TrendingUp size={14} />
                          )}

                          <span>
                            {item.points > 0 ? "+" : ""}
                            {item.points.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* View all / collapse */}
              {hasMore && (
                <div className="border-t border-(--border)">
                  <button
                    type="button"
                    onClick={() => setShowAll((current) => !current)}
                    className="flex w-full items-center justify-center gap-2 px-5 py-3.5 text-xs font-semibold text-(--primary) transition-colors hover:bg-(--surface-strong)"
                    aria-expanded={showAll}
                  >
                    {showAll ? (
                      <>
                        <ChevronUp size={15} />
                        Hide history
                      </>
                    ) : (
                      <>
                        <ChevronDown size={15} />
                        View all history
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
};
