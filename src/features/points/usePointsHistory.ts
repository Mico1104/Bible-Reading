import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export type PointsHistoryItem = {
  id: string;
  points: number;
  type: "earned";
  activityType: "daily_word" | "reading_plan";
  reason: string;
  createdAt: string;
};

export const usePointsHistory = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["points-history", userId],
    enabled: !!userId,

    queryFn: async (): Promise<PointsHistoryItem[]> => {
      if (!userId) {
        throw new Error("You must be signed in.");
      }

      const { data: pointsData, error: pointsError } = await supabase
        .from("reading_points")
        .select("id, activity_type, points, awarded_at")
        .eq("user_id", userId)
        .order("awarded_at", {
          ascending: false,
        });

      if (pointsError) {
        throw pointsError;
      }

      return (pointsData ?? []).map((item) => ({
        id: item.id,
        points: item.points,
        type: "earned" as const,
        activityType: item.activity_type,
        reason:
          item.activity_type === "daily_word"
            ? "Daily Word completed"
            : "Reading Plan completed",
        createdAt: item.awarded_at,
      }));
    },
  });
};