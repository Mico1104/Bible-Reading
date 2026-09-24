import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { differenceInCalendarDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";

const TOTAL_CHAPTERS = 1189;

export const useTodayReading = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["todays-reading", userId],

    queryFn: async () => {
      // 1. Get the user's Daily Word enrollment.
      // Daily Word enrollments have no reading plan attached.
      const { data: userPlan, error: userPlanError } = await supabase
        .from("user_plans")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .is("plan_id", null)
        .maybeSingle();

      if (userPlanError) throw userPlanError;
      if (!userPlan) {
  throw new Error("Daily Word enrollment could not be found.");
}

      // 2. Get the user's Daily Word preferences.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("testament_preference, chapters_per_day")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      // 3. Find where the user's Daily Word sequence begins.
      const startReference =
        profile.testament_preference === "NT"
          ? "Matthew 1"
          : "Genesis 1";

      const { data: startChapter, error: startError } = await supabase
        .from("bible_chapters")
        .select("global_position")
        .eq("reference", startReference)
        .single();

      if (startError) throw startError;

      // 4. Calculate how many days have passed since the
      // user started Daily Word.
      const daysSinceStart = differenceInCalendarDays(
        new Date(),
        new Date(userPlan.start_date),
      );

      // The user's Daily Word schedule has not started yet.
      if (daysSinceStart < 0) {
        return {
          chapters: [],
          daysNumber: 0,
          notStartedYet: true,
          startDate: userPlan.start_date,
        };
      }

      const chaptersPerDay = profile.chapters_per_day;
      const offset = daysSinceStart * chaptersPerDay;

      // 5. Calculate today's chapter positions.
      const positions = Array.from(
        { length: chaptersPerDay },
        (_, i) =>
          ((startChapter.global_position - 1 + offset + i) %
            TOTAL_CHAPTERS) +
          1,
      );

      // 6. Fetch today's Daily Word chapters.
      const { data: chapters, error: chaptersError } = await supabase
        .from("bible_chapters")
        .select("*")
        .in("global_position", positions)
        .order("global_position");

      if (chaptersError) throw chaptersError;

      return {
        chapters,
        daysNumber: daysSinceStart + 1,
        notStartedYet: false,
        startDate: userPlan.start_date,
      };
    },

    enabled: !!userId,
  });
};