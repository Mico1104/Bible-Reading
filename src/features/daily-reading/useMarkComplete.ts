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
      const { error } = await supabase.from("reading_progress").insert({
        user_id: userId,
        day_number: dayNumber,
      });

      if (error) throw error;

      const { data: stats } = await supabase
        .from("users_stats")
        .select("current_streak")
        .eq("user_id", userId)
        .single();

      return stats?.current_streak ?? null;
    },

    onSuccess: (newStreak) => {
      queryClient.invalidateQueries({ queryKey: ["todays-reading"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["streak-data"] });

      if (newStreak && isMilestoneStreak(newStreak)) {
        toast.success("🔥 ${newStreak}-day streak! Keep going.");
      } else {
        toast.success("Marked as read - well done!");
      }
    },
  });
};
