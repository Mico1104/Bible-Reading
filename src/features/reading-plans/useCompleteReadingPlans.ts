import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export type UserReadingPlan = {
  planId: string;
  slug: string;
  title: string;
  durationDays: number;
  status: string;
  completedDays: number;
  maxDay: number | null;
  isCompleted: boolean;
};

export const useCompletedReadingPlans = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["completed-reading-plans", userId],

    queryFn: async (): Promise<UserReadingPlan[]> => {
      if (!userId) {
        return [];
      }

      /*
       * Get all Reading Plan enrollments for this user.
       *
       * We intentionally do not rely only on user_plans.status because
       * an enrollment can have completed every day while its status is
       * still "active".
       */
      const { data: userPlans, error: userPlansError } = await supabase
        .from("user_plans")
        .select(`
          id,
          plan_id,
          status,
          reading_plan (
            id,
            slug,
            title,
            duration_days
          )
        `)
        .eq("user_id", userId)
        .not("plan_id", "is", null);

      if (userPlansError) {
        throw userPlansError;
      }

      if (!userPlans || userPlans.length === 0) {
        return [];
      }

      const userPlanIds = userPlans.map((plan) => plan.id);

      /*
       * Get the completed Reading Plan days belonging to these
       * enrollments.
       */
      const { data: progress, error: progressError } = await supabase
        .from("reading_progress")
        .select(`
          user_plan_id,
          day_number
        `)
        .eq("user_id", userId)
        .in("user_plan_id", userPlanIds);

      if (progressError) {
        throw progressError;
      }

      /*
       * Group progress by user_plan_id so each enrollment can be
       * evaluated independently.
       */
      const progressByPlan = new Map<
        string,
        {
          completedDays: number;
          maxDay: number | null;
        }
      >();

      for (const item of progress ?? []) {
        if (!item.user_plan_id) {
          continue;
        }

        const current = progressByPlan.get(item.user_plan_id) ?? {
          completedDays: 0,
          maxDay: null,
        };

        current.completedDays += 1;

        if (
          current.maxDay === null ||
          item.day_number > current.maxDay
        ) {
          current.maxDay = item.day_number;
        }

        progressByPlan.set(item.user_plan_id, current);
      }

      return userPlans
        .map((item) => {
          const readingPlan = Array.isArray(item.reading_plan)
            ? item.reading_plan[0] ?? null
            : item.reading_plan;

          if (!readingPlan) {
            return null;
          }

          const progressData = progressByPlan.get(item.id) ?? {
            completedDays: 0,
            maxDay: null,
          };

          /*
           * A plan is considered completed when:
           *
           * 1. Its status is explicitly "completed", OR
           * 2. The user has reached the final day.
           *
           * This handles existing records where status remained
           * "active" after the final day was completed.
           */
          const isCompleted =
            item.status === "completed" ||
            progressData.maxDay !== null &&
              progressData.maxDay >= readingPlan.duration_days;

          return {
            planId: item.plan_id as string,
            slug: readingPlan.slug,
            title: readingPlan.title,
            durationDays: readingPlan.duration_days,
            status: item.status,
            completedDays: progressData.completedDays,
            maxDay: progressData.maxDay,
            isCompleted,
          };
        })
        .filter(
          (plan): plan is UserReadingPlan => Boolean(plan),
        );
    },

    enabled: !!userId,
  });
};