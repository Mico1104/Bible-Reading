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
      //1. GET THE USER'S PLAN ENROLLMENT (START DATE)
      const { data: userPlan, error: userPlanError } = await supabase
        .from("user_plans")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (userPlanError) throw userPlanError;

      // 2. GET THEIR TESTAMENT PREFERENCE

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("testament_preference, chapters_per_day")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      //3. FIND THE CHAPTER POSITION WHERE THEIR SEQUENCE BEGINS

      const startReference =
        profile.testament_preference === "NT" ? "Matthew 1" : "Genesis 1";

      const { data: startChapter, error: startError } = await supabase
        .from("bible_chapters")
        .select("global_position")
        .eq("reference", startReference)
        .single();
      
      if (startError) throw startError;

      //4. WORK OUT HOW MANY CHAPTER_PAIRS HAVE ELAPSED SINCE START_DATE
      const daysSinceStart = differenceInCalendarDays(
        new Date(),
        new Date(userPlan.start_date),
      );

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

      //5. Compute the two chapter positions, wrapping with modulo
      const positions = Array.from(
        { length: chaptersPerDay },
        (_, i) =>
          ((startChapter.global_position - 1 + offset + i) % TOTAL_CHAPTERS) +
          1,
      );

      //6. Fetch those two chapters
      const { data: chapters, error: chaptersError } = await supabase
        .from("bible_chapters")
        .select("*")
        .in("global_position", positions)
        .order("global_position");

      if (chaptersError) throw chaptersError;

      return { chapters, daysNumber: daysSinceStart + 1 };
    },

    enabled: !!userId,
  });
};
