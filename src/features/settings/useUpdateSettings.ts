import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type SettingsInput = {
  chaptersPerDay: number;
  translation: string;
  reminderTime: string;
};

export const useUpdateSettings = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chaptersPerDay, translation, reminderTime }: SettingsInput) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          chapters_per_day: chaptersPerDay,
          bible_translation: translation,
          reminder_time: reminderTime || null
          
        })
        .eq("id", userId);
      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todays-reading"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Settings updated");
    },
  });
};
