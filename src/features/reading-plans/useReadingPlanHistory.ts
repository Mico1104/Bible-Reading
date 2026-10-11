import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export type ReadingPlanHistoryItem = {
  userPlanId: string;
  planId: string;
  slug: string;
  title: string;
  startDate: string;
  completionDate: string | null;
  durationDays: number;
  completedDays: number;
  pointsEarned: number;
};

export const useReadingPlanHistory = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["reading-plan-history", userId],
    enabled: !!userId,

    queryFn: async (): Promise<ReadingPlanHistoryItem[]> => {
      if (!userId) {
        return [];
      }

      const { data: enrollments, error: enrollmentError } =
        await supabase
          .from("user_plans")
          .select(`
            id,
            plan_id,
            start_date,
            status,
            reading_plan (
              id,
              slug,
              title,
              duration_days
            )
          `)
          .eq("user_id", userId)
          .not("plan_id", "is", null);

      if (enrollmentError) {
        throw enrollmentError;
      }

      if (!enrollments?.length) {
        return [];
      }

      const enrollmentIds = enrollments.map((item) => item.id);

      const { data: progress, error: progressError } =
        await supabase
          .from("reading_progress")
          .select(`
            id,
            user_plan_id,
            day_number,
            completed_at
          `)
          .eq("user_id", userId)
          .in("user_plan_id", enrollmentIds)
          .order("completed_at", { ascending: true });

      if (progressError) {
        throw progressError;
      }

      const progressRows = progress ?? [];
      const progressIds = progressRows.map((item) => item.id);

      let pointsByProgressId = new Map<string, number>();

      if (progressIds.length > 0) {
        const { data: points, error: pointsError } =
          await supabase
            .from("reading_points")
            .select("reading_progress_id, points")
            .eq("user_id", userId)
            .in("reading_progress_id", progressIds);

        if (pointsError) {
          throw pointsError;
        }

        pointsByProgressId = new Map(
          (points ?? []).map((item) => [
            item.reading_progress_id,
            item.points,
          ]),
        );
      }

      const progressByEnrollment = new Map<
        string,
        {
          dayNumbers: Set<number>;
          completionDate: string | null;
          pointsEarned: number;
        }
      >();

      for (const row of progressRows) {
        if (!row.user_plan_id) {
          continue;
        }

        const current = progressByEnrollment.get(
          row.user_plan_id,
        ) ?? {
          dayNumbers: new Set<number>(),
          completionDate: null,
          pointsEarned: 0,
        };

        current.dayNumbers.add(row.day_number);

        if (
          !current.completionDate ||
          row.completed_at > current.completionDate
        ) {
          current.completionDate = row.completed_at;
        }

        current.pointsEarned +=
          pointsByProgressId.get(row.id) ?? 0;

        progressByEnrollment.set(row.user_plan_id, current);
      }

      const history: ReadingPlanHistoryItem[] = [];

      for (const enrollment of enrollments) {
        const plan = Array.isArray(enrollment.reading_plan)
          ? enrollment.reading_plan[0] ?? null
          : enrollment.reading_plan;

        if (!plan) {
          continue;
        }

        const progressData = progressByEnrollment.get(
          enrollment.id,
        );

        const completedDays =
          progressData?.dayNumbers.size ?? 0;

        const maxDay = progressData
          ? Math.max(...progressData.dayNumbers)
          : 0;

        const isCompleted =
          enrollment.status === "completed" ||
          maxDay >= plan.duration_days;

        if (!isCompleted) {
          continue;
        }

        history.push({
          userPlanId: enrollment.id,
          planId: enrollment.plan_id as string,
          slug: plan.slug,
          title: plan.title,
          startDate: enrollment.start_date,
          completionDate:
            progressData?.completionDate ?? null,
          durationDays: plan.duration_days,
          completedDays,
          pointsEarned: progressData?.pointsEarned ?? 0,
        });
      }

      return history.sort((a, b) => {
        const dateA = a.completionDate ?? a.startDate;
        const dateB = b.completionDate ?? b.startDate;

        return dateB.localeCompare(dateA);
      });
    },
  });
};
