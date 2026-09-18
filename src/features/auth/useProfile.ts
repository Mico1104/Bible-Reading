import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";

export const useProfile = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["profile", userId],

    queryFn: async () => {
      if (!userId) {
        throw new Error("User is not signed in.");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "name, username, chapters_per_day, testament_preference, bible_translation, reminder_time, translation_provider, onboarding_completed, push_notifications_enabled",
        )
        .eq("id", userId)
        .single();

      if (error) throw error;

      return data;
    },

    enabled: !!userId,
  });
};