import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";

type ReadingPlanPassage = {
  id: string;
  plan_day_id: string;
  passage_order: number;
  reference: string;
  label: string | null;
};

type ReadingPlanDay = {
  id: string;
  plan_id: string;
  day_number: number;
  title: string | null;
  focus: string | null;
  week_number: number | null;
  memory_verse_reference: string | null;
};

type CompletedPlanDay = {
  plan_day_id: string | null;
  day_number: number;
};

type ReadingPlan = {
  id: string;
  title: string;
  description: string | null;
  duration_days: number;
  slug: string;
  plan_type: string | null;
};

type UserPlanRow = {
  id: string;
  plan_id: string;
  start_date: string;
  status: string;
  reading_plan: ReadingPlan | ReadingPlan[] | null;
};

// Get the calendar date in the user's own timezone.
// This avoids relying on the computer's timezone or UTC midnight.
const getDateInTimezone = (timezone: string): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to determine today's date.");
  }

  return `${year}-${month}-${day}`;
};

// Compare date-only values without introducing a local-time offset.
const getDaysBetween = (startDate: string, endDate: string): number => {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    throw new Error("The reading plan start date is invalid.");
  }

  return Math.round((end - start) / 86_400_000);
};

export const useTodayReadingPlan = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["today-reading-plan", userId],

    queryFn: async () => {
      if (!userId) {
        throw new Error("You must be signed in to load your reading plan.");
      }

      // Read the same timezone used by the database completion function.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("timezone")
        .eq("id", userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      const timezone = profile?.timezone?.trim() || "UTC";
      const today = getDateInTimezone(timezone);

      // IMPORTANT:
      // Match complete_reading_plan_day(), which chooses the latest
      // active enrollment by start_date and then by id.
      const { data: userPlans, error: userPlanError } = await supabase
        .from("user_plans")
        .select(`
          id,
          plan_id,
          start_date,
          status,
          reading_plan (
            id,
            title,
            description,
            duration_days,
            slug,
            plan_type
          )
        `)
        .eq("user_id", userId)
        .eq("status", "active")
        .not("plan_id", "is", null)
        .order("start_date", { ascending: false })
        .order("id", { ascending: false })
        .limit(1);

      if (userPlanError) {
        throw userPlanError;
      }

      // Having no active Reading Plan is valid.
      if (!userPlans || userPlans.length === 0) {
        return {
          enrolled: false,
          planCompleted: false,
          notStartedYet: false,
          userPlanId: null,
          plan: null,
          planDay: null,
          passages: [] as ReadingPlanPassage[],
          daysNumber: 0,
          startDate: null,
        };
      }

      const userPlan = userPlans[0] as unknown as UserPlanRow;

      const plan = Array.isArray(userPlan.reading_plan)
        ? userPlan.reading_plan[0]
        : userPlan.reading_plan;

      if (!plan) {
        throw new Error("Reading plan could not be found.");
      }

      const daysSinceStart = getDaysBetween(userPlan.start_date, today);

      if (daysSinceStart < 0) {
        return {
          enrolled: true,
          planCompleted: false,
          notStartedYet: true,
          userPlanId: userPlan.id,
          plan,
          planDay: null,
          passages: [] as ReadingPlanPassage[],
          daysNumber: 0,
          startDate: userPlan.start_date,
        };
      }

      // Load all days belonging to this plan.
      const { data: planDays, error: planDaysError } = await supabase
        .from("plan_days")
        .select(`
          id,
          plan_id,
          day_number,
          title,
          focus,
          week_number,
          memory_verse_reference
        `)
        .eq("plan_id", userPlan.plan_id)
        .order("day_number", { ascending: true });

      if (planDaysError) {
        throw planDaysError;
      }

      const days = (planDays ?? []) as ReadingPlanDay[];

      if (days.length === 0) {
        throw new Error("This reading plan has no days configured.");
      }

      // Read actual completion records for this exact enrollment.
      const { data: progress, error: progressError } = await supabase
        .from("reading_progress")
        .select("plan_day_id, day_number")
        .eq("user_id", userId)
        .eq("user_plan_id", userPlan.id)
        .not("plan_day_id", "is", null)
        .order("day_number", { ascending: true });

      if (progressError) {
        throw progressError;
      }

      const completed = (progress ?? []) as CompletedPlanDay[];

      const completedPlanDayIds = new Set(
        completed
          .map((item) => item.plan_day_id)
          .filter((id): id is string => id !== null),
      );

      // The calendar day determines which days are currently available.
      // Missed days remain eligible, but future days are not unlocked.
      const currentCalendarDay = Math.min(
        daysSinceStart + 1,
        days.length,
      );

      const eligibleDays = days.filter(
        (day) => day.day_number <= currentCalendarDay,
      );

      // Find the earliest incomplete day that is available.
      const nextIncompleteDay = eligibleDays.find(
        (day) => !completedPlanDayIds.has(day.id),
      );

      // If all available days are complete, keep today's day displayed
      // rather than prematurely moving the dashboard to a future day.
      const displayedDay =
        nextIncompleteDay ??
        days.find((day) => day.day_number === currentCalendarDay);

      // A plan is complete only when every configured day is complete.
      const allDaysCompleted = days.every((day) =>
        completedPlanDayIds.has(day.id),
      );

      if (allDaysCompleted) {
        return {
          enrolled: true,
          planCompleted: true,
          notStartedYet: false,
          userPlanId: userPlan.id,
          plan,
          planDay: null,
          passages: [] as ReadingPlanPassage[],
          daysNumber: days.length,
          startDate: userPlan.start_date,
        };
      }

      if (!displayedDay) {
        throw new Error("Today's reading plan day could not be found.");
      }

      // Load passages for the day being displayed.
      const { data: passages, error: passagesError } = await supabase
        .from("plan_passages")
        .select(`
          id,
          plan_day_id,
          passage_order,
          reference,
          label
        `)
        .eq("plan_day_id", displayedDay.id)
        .order("passage_order", { ascending: true });

      if (passagesError) {
        throw passagesError;
      }

      return {
        enrolled: true,
        planCompleted: false,
        notStartedYet: false,
        userPlanId: userPlan.id,
        plan,
        planDay: displayedDay,
        passages: (passages ?? []) as ReadingPlanPassage[],
        daysNumber: displayedDay.day_number,
        startDate: userPlan.start_date,
      };
    },

    enabled: !!userId,
  });
};
