import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";

type ReadingPlanDay = {
  id: string;
  plan_id: string;
  day_number: number;
  title: string | null;
  focus: string | null;
  week_number: number | null;
  memory_verse_reference: string | null;
};

type CompletedPlanDay = {
  plan_day_id: string;
  day_number: number;
};

export const useReadingPlanDays = (
  userPlanId: string | null | undefined,
  planId: string | null | undefined,
) => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["reading-plan-days", userId, userPlanId, planId],

    queryFn: async () => {
      if (!userId || !userPlanId || !planId) {
        return {
          days: [] as ReadingPlanDay[],
          completedDayNumbers: [] as number[],
        };
      }

      const { data: days, error: daysError } = await supabase
        .from("plan_days")
        .select(`
          id,
          plan_id,
          day_number,
          title,
          focus,
          week_number,
          memory_verse_reference
        `)
        .eq("plan_id", planId)
        .order("day_number", { ascending: true });

      if (daysError) {
        throw daysError;
      }

      const { data: progress, error: progressError } = await supabase
        .from("reading_progress")
        .select("plan_day_id, day_number")
        .eq("user_id", userId)
        .eq("user_plan_id", userPlanId)
        .not("plan_day_id", "is", null)
        .order("day_number", { ascending: true });

      if (progressError) {
        throw progressError;
      }

      const completedDayNumbers = (
        (progress ?? []) as CompletedPlanDay[]
      ).map((item) => item.day_number);

      return {
        days: (days ?? []) as ReadingPlanDay[],
        completedDayNumbers,
      };
    },

    enabled: !!userId && !!userPlanId && !!planId,
  });
};