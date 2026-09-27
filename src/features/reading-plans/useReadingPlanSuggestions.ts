import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

import {
  getReadingPlanSuggestion,
  type ReadingGrowthInterest,
} from "./readingPlanSuggestions";

import type { ReadingPlan } from "./useReadingPlans";

export const useReadingPlanSuggestions = (
  interest: ReadingGrowthInterest | null,
) => {
  return useQuery({
    queryKey: ["reading-plan-suggestions", interest],

    queryFn: async (): Promise<ReadingPlan[]> => {
      if (!interest) {
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

      /*
       * Supabase does not guarantee that the returned rows
       * follow the same order as planSlugs.
       *
       * Reorder them so the suggestions appear in the
       * intentional order defined in readingPlanSuggestions.ts.
       */
      return suggestion.planSlugs
        .map((slug) => plans.find((plan) => plan.slug === slug))
        .filter((plan): plan is ReadingPlan => Boolean(plan));
    },

    enabled: Boolean(interest),
  });
};

