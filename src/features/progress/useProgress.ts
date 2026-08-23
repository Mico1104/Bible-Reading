import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { differenceInCalendarDays, isSameDay, subDays } from "date-fns";

export const useProgress = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["progress", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reading_progress")
        .select("*, plan_days(day_number)")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const calculateStreak = (
  progress: { completed_at: string }[] | undefined,
): number => {
  if (!progress || progress.length === 0) return 0;

  const completedDates = progress.map((p) => new Date(p.completed_at));
  const today = new Date();

  //Streak only counts if the most recent entry is today or yesterday
  const mostRecent = completedDates[0];
  const gap = differenceInCalendarDays(today, mostRecent);

  if (gap > 1) return 0;

  let streak = 1;
  let cursor = mostRecent;

  for (let i = 1; i < completedDates.length; i++) {
    const expectedPrevDay = subDays(cursor, 1);
    if (isSameDay(completedDates[i], expectedPrevDay)) {
      streak++;
      cursor = completedDates[i];
    } else if (!isSameDay(completedDates[i], cursor)) {
      break;
    }
  }

  return streak;
};
