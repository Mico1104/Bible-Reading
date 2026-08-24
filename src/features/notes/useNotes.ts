import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export const useNotes = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["notes", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

        if(error) throw error;
        return data;
    },

    enabled: !!userId,
  });
};
