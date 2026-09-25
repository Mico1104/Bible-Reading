import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export type ReadingPlan = {
  id: string;
  title: string;
  description: string | null;
  duration_days: number;
  slug: string;
  plan_type: "topic" | "character";
};

export const useReadingPlans = (planType: "topic" | "character") => {
  return useQuery({
    queryKey: ["reading-plans", planType],

    queryFn: async () => {
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
        .eq("plan_type", planType)
        .order("title", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as ReadingPlan[];
    },
  });
};

