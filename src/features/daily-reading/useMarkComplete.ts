import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
      toast.success("Marked as read - well done!")
    },

    onError: (err) => {
      toast.error(err.message || "Couldn't save that. Try again")
    }

  });
};
