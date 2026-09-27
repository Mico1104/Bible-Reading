import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isMilestoneStreak } from "../progress/insights";

export const useMarkComplete = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dayNumber: number) => {
      if (!userId) {
        throw new Error(
          "You must be signed in to mark a reading complete.",
        );
      }

      const { error } = await supabase.rpc("complete_daily_word", {
        p_day_number: dayNumber,
      });

      if (error) {
        throw error;
      }

      const { data: stats, error: statsError } = await supabase
        .from("user_stats")
        .select("current_streak")
        .eq("user_id", userId)
        .maybeSingle();

      if (statsError) {
        throw statsError;
      }

      return stats?.current_streak ?? 0;
    },

    onSuccess: (newStreak) => {
      queryClient.invalidateQueries({
        queryKey: ["todays-reading"],
      });

      queryClient.invalidateQueries({
        queryKey: ["progress"],
      });

      queryClient.invalidateQueries({
        queryKey: ["streak-data"],
      });

      queryClient.invalidateQueries({
        queryKey: ["reading-points", userId],
      });

      if (newStreak && isMilestoneStreak(newStreak)) {
        toast.success(`🔥 ${newStreak}-day streak! Keep going.`);
      } else {
        toast.success("Marked as read - well done!");
      }
    },

    onError: (error) => {
      console.error("Daily Word completion error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to mark today's reading as complete.",
      );
    },
  });
};