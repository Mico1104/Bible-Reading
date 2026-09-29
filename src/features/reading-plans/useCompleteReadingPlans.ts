import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export const useCompletedReadingPlans = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["completed-reading-plans", userId],

    queryFn: async () => {
      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from("user_plans")
        .select(`
          plan_id,
          reading_plan (
            id,
            slug,
            title
          )
        `)
        .eq("user_id", userId)
        .eq("status", "completed")
        .not("plan_id", "is", null);

      if (error) {
        throw error;
      }

      return (data ?? []).map((item) => {
        const readingPlan = Array.isArray(item.reading_plan)
          ? item.reading_plan[0] ?? null
          : item.reading_plan;

        return {
          planId: item.plan_id,
          slug: readingPlan?.slug ?? null,
          title: readingPlan?.title ?? null,
        };
      });
    },

    enabled: !!userId,
  });
};

