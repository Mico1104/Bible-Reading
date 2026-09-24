import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export type ReadingPlanPassage = {
  id: string;
  plan_day_id: string;
  passage_order: number;
  reference: string;
  label: string | null;
};

export const useReadingPlanPassages = (
  planDayId: string | null | undefined,
) => {
  return useQuery({
    queryKey: ["reading-plan-passages", planDayId],

    queryFn: async () => {
      if (!planDayId) {
        return [] as ReadingPlanPassage[];
      }

      const { data, error } = await supabase
        .from("plan_passages")
        .select(`
          id,
          plan_day_id,
          passage_order,
          reference,
          label
        `)
        .eq("plan_day_id", planDayId)
        .order("passage_order", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as ReadingPlanPassage[];
    },

    enabled: !!planDayId,
  });
};