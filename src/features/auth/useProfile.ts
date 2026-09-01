import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";

export const useProfile = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "name, username, chapters_per_day, testament_preference, bible_translation",
        )
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },

    enabled: !!userId,
  });
};
