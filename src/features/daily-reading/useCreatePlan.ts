import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreatePlan = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return useMutation({
    mutationFn: async ({
      name,
      username,
      testament,
      chaptersPerDay,
      startDate,
      reminderTime,
    }: {
      name?: string;
      username?: string;
      testament: "OT" | "NT";
      chaptersPerDay: number;
      startDate: string;
      reminderTime: string | null;
    }) => {
      if (!userId) {
        throw new Error("You must be signed in to create a reading plan.");
      }

      const profileUpdates: Record<string, unknown> = {
        testament_preference: testament,
        chapters_per_day: chaptersPerDay,
        reminder_time: reminderTime,
        timezone: detectedTimezone,
        onboarding_completed: true,
      };

      // Only update name/username when the Google onboarding form
      // supplies them.
      if (name !== undefined) {
        profileUpdates.name = name.trim();
      }

      if (username !== undefined) {
        profileUpdates.username = username.trim();
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", userId);

      if (profileError) {
        if (profileError.code === "23505") {
          throw new Error(
            "That username is already taken. Please choose another one.",
          );
        }

        throw profileError;
      }

      // Create their plan enrollment
      const { error: planError } = await supabase
        .from("user_plans")
        .insert({
          user_id: userId,
          status: "active",
          start_date: startDate,
        });

      if (planError && planError.code !== "23505") {
        throw planError;
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todays-reading"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      toast.success("Your reading plan is ready!");
    },

    onError: (error) => {
      toast.error(error.message || "Unable to create your reading plan.");
    },
  });
};