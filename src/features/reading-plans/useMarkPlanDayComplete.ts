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

      // Record the completed plan day.
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

      // Get the plan duration.
      const { data: userPlan, error: userPlanError } = await supabase
        .from("user_plans")
        .select(
          `
            id,
            status,
            reading_plan (
              duration_days
            )
          `,
        )
        .eq("id", userPlanId)
        .eq("user_id", userId)
        .maybeSingle();

      if (userPlanError) {
        throw userPlanError;
      }

      if (!userPlan) {
        throw new Error("Reading plan enrollment could not be found.");
      }

      // Supabase returns the related reading_plan as an array.
      const readingPlan = Array.isArray(userPlan.reading_plan)
  ? userPlan.reading_plan[0]
  : userPlan.reading_plan;

if (!readingPlan) {
  throw new Error("Reading plan details could not be found.");
}

      const durationDays = readingPlan.duration_days;

      if (!durationDays) {
        throw new Error("Reading plan duration could not be determined.");
      }

      // Count the user's completed plan days.
      const { count: completedDays, error: countError } = await supabase
        .from("reading_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("user_plan_id", userPlanId)
        .not("plan_day_id", "is", null);

      if (countError) {
        throw countError;
      }

      const planCompleted = (completedDays ?? 0) >= durationDays;

      // Only mark the enrollment completed when every
      // plan day has actually been completed.
      if (planCompleted && userPlan.status === "active") {
        const { error: updateError } = await supabase
          .from("user_plans")
          .update({
            status: "completed",
          })
          .eq("id", userPlanId)
          .eq("user_id", userId);

        if (updateError) {
          throw updateError;
        }
      }

      return {
        dayNumber,
        planDayId,
        planCompleted,
      };
    },

    onSuccess: ({ dayNumber, planCompleted }) => {
  queryClient.invalidateQueries({ queryKey: ["today-reading-plan"] });
  queryClient.invalidateQueries({ queryKey: ["progress"] });
  queryClient.invalidateQueries({ queryKey: ["reading-plans"] });

  // Refresh reading points
  queryClient.invalidateQueries({
    queryKey: ["reading-points", userId],
  });

  if (planCompleted) {
    toast.success(
      "Congratulations! You have completed the entire reading plan.",
    );
  } else {
    toast.success(`Day ${dayNumber} completed! Keep going.`);
  }
},

    onError: (error) => {
      toast.error(error.message || "Unable to complete this reading plan day.");
    },
  });
};

