import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { differenceInCalendarDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";

type ReadingPlanPassage = {
  id: string;
  plan_day_id: string;
  passage_order: number;
  reference: string;
  label: string | null;
};

export const useTodayReadingPlan = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["today-reading-plan", userId],

    queryFn: async () => {
      // Reading Plans are optional.
      // Find an active enrollment that actually has a plan attached.
      const { data: userPlans, error: userPlanError } = await supabase
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
        .limit(1);

      if (userPlanError) throw userPlanError;

      // No active Reading Plan is completely valid.
      if (!userPlans || userPlans.length === 0) {
        return {
          enrolled: false,
          planCompleted: false,
          notStartedYet: false,
          userPlanId: null,
          plan: null,
          planDay: null,
          passages: [] as ReadingPlanPassage[],
          daysNumber: 0,
          startDate: null,
        };
      }

      const userPlan = userPlans[0];

      const plan = Array.isArray(userPlan.reading_plan)
        ? userPlan.reading_plan[0]
        : userPlan.reading_plan;

      if (!plan) {
        throw new Error("Reading plan could not be found.");
      }

      // Calculate the current day of the Reading Plan.
      const daysSinceStart = differenceInCalendarDays(
        new Date(),
        new Date(userPlan.start_date),
      );

      // The plan hasn't started yet.
      if (daysSinceStart < 0) {
        return {
          enrolled: true,
          planCompleted: false,
          notStartedYet: true,
          userPlanId: userPlan.id,
          plan,
          planDay: null,
          passages: [] as ReadingPlanPassage[],
          daysNumber: 0,
          startDate: userPlan.start_date,
        };
      }

      const dayNumber = daysSinceStart + 1;

      // The plan has finished.
      if (dayNumber > plan.duration_days) {
        return {
          enrolled: true,
          planCompleted: true,
          notStartedYet: false,
          userPlanId: userPlan.id,
          plan,
          planDay: null,
          passages: [] as ReadingPlanPassage[],
          daysNumber: dayNumber,
          startDate: userPlan.start_date,
        };
      }

      // Get today's plan day.
      const { data: planDay, error: planDayError } = await supabase
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
        .eq("plan_id", userPlan.plan_id)
        .eq("day_number", dayNumber)
        .single();

      if (planDayError) throw planDayError;

      // Get today's assigned passages.
      const { data: passages, error: passagesError } = await supabase
        .from("plan_passages")
        .select(`
          id,
          plan_day_id,
          passage_order,
          reference,
          label
        `)
        .eq("plan_day_id", planDay.id)
        .order("passage_order", { ascending: true });

      if (passagesError) throw passagesError;

      return {
        enrolled: true,
        planCompleted: false,
        notStartedYet: false,
        userPlanId: userPlan.id,
        plan,
        planDay,
        passages: (passages ?? []) as ReadingPlanPassage[],
        daysNumber: dayNumber,
        startDate: userPlan.start_date,
      };
    },

    enabled: !!userId,
  });
};