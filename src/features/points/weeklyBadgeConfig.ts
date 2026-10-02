import {
  CalendarCheck,
  CalendarDays,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type WeeklyBadge = {
  name: string;
  minDays: number;
  icon: LucideIcon;
  description: string;
};

export const WEEKLY_BADGES: WeeklyBadge[] = [
  {
    name: "Steady Week",
    minDays: 3,
    icon: CalendarDays,
    description: "You showed up on three different days this week.",
  },
  {
    name: "Faithful Week",
    minDays: 5,
    icon: CalendarCheck,
    description: "You kept a steady reading rhythm through most of the week.",
  },
  {
    name: "Complete Week",
    minDays: 7,
    icon: Trophy,
    description: "You stayed with your reading every day this week.",
  },
];

export const getWeeklyBadge = (
  activeDays: number,
): WeeklyBadge | null =>
  [...WEEKLY_BADGES]
    .reverse()
    .find((badge) => activeDays >= badge.minDays) ?? null;

export const getNextWeeklyBadge = (
  activeDays: number,
): WeeklyBadge | null =>
  WEEKLY_BADGES.find((badge) => badge.minDays > activeDays) ?? null;