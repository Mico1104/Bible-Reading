import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useMarkPlanDayComplete = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dayNumber: number) => {
      if (!userId) {
        throw new Error(
          "You must be signed in to complete a reading plan.",
        );
      }

      const { data, error } = await supabase.rpc(
        "complete_reading_plan_day",
        {
          p_day_number: dayNumber,
        },
      );

      if (error) {
        throw error;
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["today-reading-plan", userId],
      });

      queryClient.invalidateQueries({
        queryKey: ["reading-plan-days", userId],
      });

      queryClient.invalidateQueries({
        queryKey: ["reading-plans"],
      });

      queryClient.invalidateQueries({
        queryKey: ["progress"],
      });

      queryClient.invalidateQueries({
        queryKey: ["reading-points", userId],
      });

      queryClient.invalidateQueries({
  queryKey: ["active-reading-plan", userId],
});

queryClient.invalidateQueries({
  queryKey: ["completed-reading-plans", userId],
});

      toast.success("Today's reading plan is complete!");
    },

    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to complete today's reading plan.",
      );
    },
  });
};