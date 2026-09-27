import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export type ReadingPoints = {
  total: number;
  dailyWord: number;
  readingPlan: number;
};

export const useReadingPoints = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["reading-points", userId],
    enabled: !!userId,
    queryFn: async (): Promise<ReadingPoints> => {
      if (!userId) {
        throw new Error("You must be signed in.");
      }

      const { data, error } = await supabase
        .from("reading_points")
        .select("activity_type, points")
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      const dailyWord = (data ?? [])
        .filter((item) => item.activity_type === "daily_word")
        .reduce((total, item) => total + item.points, 0);

      const readingPlan = (data ?? [])
        .filter((item) => item.activity_type === "reading_plan")
        .reduce((total, item) => total + item.points, 0);

      return {
        total: dailyWord + readingPlan,
        dailyWord,
        readingPlan,
      };
    },
  });
};