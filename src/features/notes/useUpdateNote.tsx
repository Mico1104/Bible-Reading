import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type UpdateNoteInput = {
  id: string;
  reference: string;
  content: string;
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reference, content }: UpdateNoteInput) => {
      const { error } = await supabase
        .from("notes")
        .update({ reference, content })
        .eq("id", id);

      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note updated.");
    },
  });
};
