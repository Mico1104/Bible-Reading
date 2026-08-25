import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todays-reading"] });
      queryClient.invalidateQueries({queryKey: ["progress"]})
    },
  });
};
