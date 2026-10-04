import { Flame } from "lucide-react";
import { getCurrentStreakAchievement } from "./streakAchievementConfig";

type StreakAchievementCardProps = {
  currentStreak: number;
};

export const StreakAchievementCard = ({
  currentStreak,
}: StreakAchievementCardProps) => {
  const achievement = getCurrentStreakAchievement(currentStreak);

  if (!achievement) {
    return null;
  }

  const Icon = achievement.icon;

  return (
    <section
      aria-label="Streak achievement"
      className="mt-3 max-w-3xl overflow-hidden rounded-xl border border-(--border) bg-(--surface)"
    >
      <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--surface-strong) text-(--primary)">
          <Flame size={18} strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--muted)">
            Streak achievement
          </p>

          <p className="mt-0.5 text-xs text-(--muted-strong)">
            A milestone from your reading journey
          </p>
        </div>
      </div>

      <div className="border-t border-(--border) p-4 sm:p-5">
        <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--surface-strong)/50 p-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--surface) text-(--primary)">
            <Icon size={22} strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-(--text)">
              {achievement.name}
            </p>

            <p className="mt-0.5 text-[11px] leading-5 text-(--muted)">
              {achievement.description}
            </p>

            <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-(--primary)">
              <Flame size={11} />
              {currentStreak}-day streak
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

