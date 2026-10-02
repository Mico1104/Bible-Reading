import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import {
  getNextWeeklyBadge,
  getWeeklyBadge,
} from "./weeklyBadgeConfig";

type WeeklyBadgeData = {
  activeDays: number;
  weekStart: string;
  weekEnd: string;
  badge: ReturnType<typeof getWeeklyBadge>;
  nextBadge: ReturnType<typeof getNextWeeklyBadge>;
};

const getLocalDateParts = (
  date: Date,
  timeZone: string,
): {
  year: number;
  month: number;
  day: number;
  weekday: number;
} => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: weekdayMap[get("weekday")] ?? 0,
  };
};

const toDateKey = (date: Date, timeZone: string) => {
  const parts = getLocalDateParts(date, timeZone);

  return [
    parts.year,
    String(parts.month).padStart(2, "0"),
    String(parts.day).padStart(2, "0"),
  ].join("-");
};

const getDateKeyOffset = (
  date: Date,
  timeZone: string,
  offsetDays: number,
) => {
  const parts = getLocalDateParts(date, timeZone);

  const utcDate = new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day + offsetDays,
    ),
  );

  return utcDate.toISOString().slice(0, 10);
};

export const useWeeklyBadge = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["weekly-badge", userId],
    enabled: !!userId,

    queryFn: async (): Promise<WeeklyBadgeData> => {
      if (!userId) {
        throw new Error("You must be signed in.");
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("timezone")
          .eq("id", userId)
          .single();

      if (profileError) {
        throw profileError;
      }

      const timeZone = profile?.timezone || "UTC";
      const now = new Date();

      const localToday = getLocalDateParts(
        now,
        timeZone,
      );

      // Monday is the beginning of the reading week.
      const daysSinceMonday =
        localToday.weekday === 0
          ? 6
          : localToday.weekday - 1;

      const weekStart = getDateKeyOffset(
        now,
        timeZone,
        -daysSinceMonday,
      );

      const weekEnd = getDateKeyOffset(
        now,
        timeZone,
        6 - daysSinceMonday,
      );

      // Use a slightly wider UTC window so timezone boundaries
      // do not exclude completions near midnight.
      const windowStart = new Date(
        `${weekStart}T00:00:00Z`,
      );

      windowStart.setUTCDate(
        windowStart.getUTCDate() - 1,
      );

      const windowEnd = new Date(
        `${weekEnd}T00:00:00Z`,
      );

      windowEnd.setUTCDate(
        windowEnd.getUTCDate() + 2,
      );

      const {
        data: progress,
        error: progressError,
      } = await supabase
        .from("reading_progress")
        .select("completed_at")
        .eq("user_id", userId)
        .gte(
          "completed_at",
          windowStart.toISOString(),
        )
        .lt(
          "completed_at",
          windowEnd.toISOString(),
        );

      if (progressError) {
        throw progressError;
      }

      const activeDateKeys = new Set(
        (progress ?? [])
          .map(
            (item) =>
              new Date(item.completed_at),
          )
          .map((date) =>
            toDateKey(date, timeZone),
          )
          .filter(
            (dateKey) =>
              dateKey >= weekStart &&
              dateKey <= weekEnd,
          ),
      );

      const activeDays = activeDateKeys.size;

      return {
        activeDays,
        weekStart,
        weekEnd,
        badge: getWeeklyBadge(activeDays),
        nextBadge: getNextWeeklyBadge(activeDays),
      };
    },
  });
};