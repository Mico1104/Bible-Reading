
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useStartReadingPlan = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      if (!userId) {
        throw new Error("You must be signed in to start a reading plan.");
      }

      // Check whether the user already has an active Reading Plan.
      const { data: activePlan, error: activePlanError } = await supabase
        .from("user_plans")
        .select("id, plan_id")
        .eq("user_id", userId)
        .eq("status", "active")
        .not("plan_id", "is", null)
        .maybeSingle();

      if (activePlanError) {
        throw activePlanError;
      }

      if (activePlan) {
        throw new Error(
          "You already have an active reading plan. Complete it before starting another one.",
        );
      }

      // Start the selected Reading Plan today.
      const { data, error } = await supabase
        .from("user_plans")
        .insert({
          user_id: userId,
          plan_id: planId,
          start_date: new Date().toISOString().split("T")[0],
          status: "active",
        })
        .select("id, user_id, plan_id, start_date, status")
        .single();

      if (error) {
        // The database constraint is the final protection against
        // multiple active Reading Plans.
        if (error.code === "23505") {
          throw new Error(
            "You already have an active reading plan. Complete it before starting another one.",
          );
        }

        throw error;
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["today-reading-plan"],
      });

      queryClient.invalidateQueries({
        queryKey: ["reading-plans"],
      });

      toast.success("Reading plan started!");
    },

    onError: (error) => {
      toast.error(
        error.message || "Unable to start the reading plan.",
      );
    },
  });
};

