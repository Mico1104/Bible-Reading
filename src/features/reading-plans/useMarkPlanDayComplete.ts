import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useMarkPlanDayComplete = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userPlanId,
      planDayId,
      dayNumber,
    }: {
      userPlanId: string;
      planDayId: string;
      dayNumber: number;
    }) => {
      if (!userId) {
        throw new Error("You must be signed in.");
      }

      // Check whether this plan day has already been completed.
      const { data: existingProgress, error: existingError } = await supabase
        .from("reading_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("user_plan_id", userPlanId)
        .eq("plan_day_id", planDayId)
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingProgress) {
        throw new Error("This reading plan day has already been completed.");
      }

      // Make sure the user is completing the correct plan day.
      const { data: latestProgress, error: latestError } = await supabase
        .from("reading_progress")
        .select("day_number")
        .eq("user_id", userId)
        .eq("user_plan_id", userPlanId)
        .not("plan_day_id", "is", null)
        .order("day_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestError) {
        throw latestError;
      }

      const expectedDayNumber = latestProgress
        ? latestProgress.day_number + 1
        : 1;

      if (dayNumber !== expectedDayNumber) {
        throw new Error(
          `You need to complete Day ${expectedDayNumber} before continuing.`,
        );
      }

      const { error: insertError } = await supabase
        .from("reading_progress")
        .insert({
          user_id: userId,
          user_plan_id: userPlanId,
          plan_day_id: planDayId,
          day_number: dayNumber,
        });

      if (insertError) {
        throw insertError;
      }

      return {
        dayNumber,
        planDayId,
      };
    },

    onSuccess: ({ dayNumber }) => {
      queryClient.invalidateQueries({
        queryKey: ["today-reading-plan"],
      });

      queryClient.invalidateQueries({
        queryKey: ["progress"],
      });

      toast.success(`Day ${dayNumber} completed! Keep going.`);
    },

    onError: (error) => {
      toast.error(error.message || "Unable to complete this reading plan day.");
    },
  });
};