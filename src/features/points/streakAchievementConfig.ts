import {
  Flame,
  FlameKindling,
  Medal,
  ShieldCheck,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type StreakAchievement = {
  name: string;
  minDays: number;
  icon: LucideIcon;
  description: string;
};

export const STREAK_ACHIEVEMENTS: StreakAchievement[] = [
  {
    name: "Getting Started",
    minDays: 3,
    icon: FlameKindling,
    description: "You reached a three-day reading streak.",
  },
  {
    name: "One Week Strong",
    minDays: 7,
    icon: Flame,
    description: "You kept your reading rhythm for a full week.",
  },
  {
    name: "Two Weeks Faithful",
    minDays: 14,
    icon: ShieldCheck,
    description: "You stayed faithful to your reading for two weeks.",
  },
  {
    name: "Month of Faithfulness",
    minDays: 30,
    icon: Medal,
    description: "You reached a 30-day reading streak.",
  },
  {
    name: "Steadfast",
    minDays: 60,
    icon: Star,
    description: "You maintained a steady reading rhythm for 60 days.",
  },
  {
    name: "Faithful Journey",
    minDays: 100,
    icon: Trophy,
    description: "You reached an impressive 100-day reading streak.",
  },
];

export const getCurrentStreakAchievement = (
  currentStreak: number,
): StreakAchievement | null =>
  [...STREAK_ACHIEVEMENTS]
    .reverse()
    .find((achievement) => currentStreak >= achievement.minDays) ?? null;

export const getNextStreakAchievement = (
  currentStreak: number,
): StreakAchievement | null =>
  STREAK_ACHIEVEMENTS.find(
    (achievement) => achievement.minDays > currentStreak,
  ) ?? null;

