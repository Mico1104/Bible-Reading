import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreatePlan = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      testament,
      chaptersPerDay,
    }: {
      testament: "OT" | "NT";
      chaptersPerDay: number;
    }) => {
      //Save their choice on the profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          testament_preference: testament,
          chapters_per_day: chaptersPerDay,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      //Create their plan enrollment, starting today
      const { error: planError } = await supabase.from("user_plans").insert({
        user_id: userId,
        status: "active",
        start_date: new Date().toISOString().slice(0, 10),
      });
      if (planError) throw planError;

      const { data: existing } = await supabase
        .from("user_plans")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      if (existing) {
        throw new Error("You already have an active reading plan.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todays-reading"] });
    },
  });
};
