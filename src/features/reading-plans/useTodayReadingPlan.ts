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
  plan_day_id: string | null;
  day_number: number;
};

export const useTodayReadingPlan = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["today-reading-plan", userId],

    queryFn: async () => {
      // Reading Plans are optional.
      // Find an active enrollment that has a plan attached.
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

      if (userPlanError) {
        throw userPlanError;
      }

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

      // Check whether the plan's start date is still in the future.
      const daysSinceStart = differenceInCalendarDays(
        new Date(),
        new Date(userPlan.start_date),
      );

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

      // Load all days belonging to this reading plan.
      const { data: planDays, error: planDaysError } = await supabase
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
        .order("day_number", { ascending: true });

      if (planDaysError) {
        throw planDaysError;
      }

      const days = (planDays ?? []) as ReadingPlanDay[];

      if (days.length === 0) {
        throw new Error(
          "This reading plan has no days configured.",
        );
      }

      // Read actual completion records for this enrollment.
      const { data: progress, error: progressError } = await supabase
        .from("reading_progress")
        .select("plan_day_id, day_number")
        .eq("user_id", userId)
        .eq("user_plan_id", userPlan.id)
        .not("plan_day_id", "is", null)
        .order("day_number", { ascending: true });

      if (progressError) {
        throw progressError;
      }

      const completed = (progress ?? []) as CompletedPlanDay[];

      // Use plan_day_id as the primary identifier so completion
      // is associated with the correct day in this particular plan.
      const completedPlanDayIds = new Set(
        completed
          .map((item) => item.plan_day_id)
          .filter((id): id is string => id !== null),
      );

      // A plan is complete only when every configured day
      // has an actual completion record.
      const nextPlanDay = days.find(
        (day) => !completedPlanDayIds.has(day.id),
      );

      if (!nextPlanDay) {
        return {
          enrolled: true,
          planCompleted: true,
          notStartedYet: false,
          userPlanId: userPlan.id,
          plan,
          planDay: null,
          passages: [] as ReadingPlanPassage[],
          daysNumber: days.length,
          startDate: userPlan.start_date,
        };
      }

      // Load the passages for the next uncompleted day.
      // This works even when the original calendar schedule has passed.
      const { data: passages, error: passagesError } = await supabase
        .from("plan_passages")
        .select(`
          id,
          plan_day_id,
          passage_order,
          reference,
          label
        `)
        .eq("plan_day_id", nextPlanDay.id)
        .order("passage_order", { ascending: true });

      if (passagesError) {
        throw passagesError;
      }

      return {
        enrolled: true,
        planCompleted: false,
        notStartedYet: false,
        userPlanId: userPlan.id,
        plan,
        planDay: nextPlanDay,
        passages: (passages ?? []) as ReadingPlanPassage[],
        daysNumber: nextPlanDay.day_number,
        startDate: userPlan.start_date,
      };
    },

    enabled: !!userId,
  });
};
