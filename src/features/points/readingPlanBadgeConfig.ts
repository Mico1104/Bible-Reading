import {
  BookCheck,
  type LucideIcon,
} from "lucide-react";

export type ReadingPlanBadge = {
  icon: LucideIcon;
  description: string;
};

export const getReadingPlanBadge = (): ReadingPlanBadge => ({
  icon: BookCheck,
  description: "Reading Plan completed",
});
