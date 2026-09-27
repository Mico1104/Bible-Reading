import {
  BookOpen,
  Crown,
  Flame,
  Shield,
  Sprout,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type ReadingBadge = {
  name: string;
  minPoints: number;
  maxPoints: number | null;
  icon: LucideIcon;
  description: string;
};

export const READING_BADGES: ReadingBadge[] = [
  {
    name: "New Reader",
    minPoints: 0,
    maxPoints: 24,
    icon: Sprout,
    description: "You've started your journey in the Word.",
  },
  {
    name: "Growing Reader",
    minPoints: 25,
    maxPoints: 74,
    icon: BookOpen,
    description: "Your reading rhythm is beginning to grow.",
  },
  {
    name: "Steady Reader",
    minPoints: 75,
    maxPoints: 149,
    icon: Star,
    description: "You're building a steady habit of reading.",
  },
  {
    name: "Faithful Reader",
    minPoints: 150,
    maxPoints: 299,
    icon: Flame,
    description: "You've established a faithful reading rhythm.",
  },
  {
    name: "Dedicated Reader",
    minPoints: 300,
    maxPoints: 499,
    icon: Shield,
    description: "Your commitment to reading continues to grow.",
  },
  {
    name: "Devoted Reader",
    minPoints: 500,
    maxPoints: 999,
    icon: Crown,
    description: "You've built a deeply consistent reading habit.",
  },
  {
    name: "Scripture Companion",
    minPoints: 1000,
    maxPoints: null,
    icon: Trophy,
    description: "You've accumulated a remarkable reading journey.",
  },
];

export const getReadingBadge = (points: number): ReadingBadge => {
  const badge =
    [...READING_BADGES]
      .reverse()
      .find((item) => points >= item.minPoints) ??
    READING_BADGES[0];

  return badge;
};

export const getNextReadingBadge = (
  points: number,
): ReadingBadge | null => {
  return (
    READING_BADGES.find((badge) => badge.minPoints > points) ?? null
  );
};