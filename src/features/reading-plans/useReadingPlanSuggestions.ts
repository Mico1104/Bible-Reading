import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

import {
  getReadingPlanSuggestion,
  type ReadingGrowthInterest,
} from "./readingPlanSuggestions";

import type { ReadingPlan } from "./useReadingPlans";
import { useActiveReadingPlan } from "./useActiveReadingPlan";
import { useCompletedReadingPlans } from "./useCompleteReadingPlans";

export const useReadingPlanSuggestions = (
  interest: ReadingGrowthInterest | null,
) => {
  const userId = useAuthStore((state) => state.user?.id);

  const { data: activeReadingPlan } = useActiveReadingPlan();

  const { data: completedPlans = [] } = useCompletedReadingPlans();

  const completedPlanSlugs = new Set(
    completedPlans
      .map((plan) => plan.slug)
      .filter((slug): slug is string => Boolean(slug)),
  );

  const activePlanSlug = activeReadingPlan?.reading_plan?.slug ?? null;

  return useQuery({
    queryKey: [
      "reading-plan-suggestions",
      interest,
      activePlanSlug,
      [...completedPlanSlugs].sort(),
    ],

    queryFn: async (): Promise<ReadingPlan[]> => {
      if (!interest || !userId) {
        return [];
      }

      const suggestion = getReadingPlanSuggestion(interest);

      if (!suggestion) {
        return [];
      }

      const { data, error } = await supabase
        .from("reading_plan")
        .select(`
          id,
          title,
          description,
          duration_days,
          slug,
          plan_type
        `)
        .in("slug", suggestion.planSlugs);

      if (error) {
        throw error;
      }

      const plans = (data ?? []) as ReadingPlan[];

      return suggestion.planSlugs
        .map((slug) => plans.find((plan) => plan.slug === slug))
        .filter((plan): plan is ReadingPlan => {
          if (!plan) {
            return false;
          }

          // Do not recommend the plan the user is currently following.
          if (plan.slug === activePlanSlug) {
            return false;
          }

          // Do not recommend plans the user has already completed.
          if (completedPlanSlugs.has(plan.slug)) {
            return false;
          }

          return true;
        });
    },

    enabled: Boolean(interest && userId),
  });
};

