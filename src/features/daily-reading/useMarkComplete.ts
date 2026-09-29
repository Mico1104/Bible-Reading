import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isMilestoneStreak } from "../progress/insights";

const ALREADY_COMPLETED_MESSAGE =
  "Today's Daily Word is already marked as complete";

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
        // A duplicate completion is an expected user action,
        // not a real application failure.
        if (error.message === ALREADY_COMPLETED_MESSAGE) {
          return {
            alreadyCompleted: true,
            newStreak: 0,
          };
        }

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

      return {
        alreadyCompleted: false,
        newStreak: stats?.current_streak ?? 0,
      };
    },

    onSuccess: ({ alreadyCompleted, newStreak }) => {
      if (alreadyCompleted) {
        toast.info("Today's Daily Word is already marked as complete.");
        return;
      }

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

      queryClient.invalidateQueries({
        queryKey: ["points-history", userId],
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

