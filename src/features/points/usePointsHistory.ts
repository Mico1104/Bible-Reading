import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export type PointsHistoryItem = {
  id: string;
  points: number;
  type: "earned" | "adjustment";
  activityType: "daily_word" | "reading_plan" | null;
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

      const [
        { data: pointsData, error: pointsError },
        { data: adjustmentData, error: adjustmentError },
      ] = await Promise.all([
        supabase
          .from("reading_points")
          .select("id, activity_type, points, awarded_at")
          .eq("user_id", userId),

        supabase
          .from("reading_point_adjustments")
          .select(
            "id, adjustment, reason, source, created_at",
          )
          .eq("user_id", userId),
      ]);

      if (pointsError) {
        throw pointsError;
      }

      if (adjustmentError) {
        throw adjustmentError;
      }

      const earnedPoints: PointsHistoryItem[] = (
        pointsData ?? []
      ).map((item) => ({
        id: item.id,
        points: item.points,
        type: "earned",
        activityType: item.activity_type,
        reason:
          item.activity_type === "daily_word"
            ? "Daily Word completed"
            : "Reading Plan completed",
        createdAt: item.awarded_at,
      }));

      const adjustments: PointsHistoryItem[] = (
        adjustmentData ?? []
      ).map((item) => ({
        id: item.id,
        points: item.adjustment,
        type: "adjustment",
        activityType: item.source,
        reason:
          item.source === "daily_word"
            ? "Daily Word inactivity"
            : "Reading Plan inactivity",
        createdAt: item.created_at,
      }));

      return [...earnedPoints, ...adjustments].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      );
    },
  });
};