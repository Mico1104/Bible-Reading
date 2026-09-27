import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";

export const useActiveReadingPlan = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["active-reading-plan", userId],

    queryFn: async () => {
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from("user_plans")
        .select(`
          id,
          plan_id,
          start_date,
          status,
          reading_plan (
            id,
            title,
            description,
            duration_days,
            slug,
            plan_type
          )
        `)
        .eq("user_id", userId)
        .eq("status", "active")
        .not("plan_id", "is", null)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        ...data,
        reading_plan: Array.isArray(data.reading_plan)
          ? data.reading_plan[0] ?? null
          : data.reading_plan,
      };
    },

    enabled: !!userId,
  });
};