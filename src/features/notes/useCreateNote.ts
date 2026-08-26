import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type NewNote = {
  reference: string;
  content: string;
};

export const useCreateNote = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: NewNote) => {
      const { error } = await supabase.from("notes").insert({
        user_id: userId,
        reference: note.reference,
        content: note.content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note saved");
    },
  });
};
