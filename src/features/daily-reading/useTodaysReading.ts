import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { differenceInCalendarDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";

export const useTodayReading = () => {
  const userId = useAuthStore((state) => state.user?.id);
  console.log("Current User Id:", userId);

  return useQuery({
    queryKey: ["todays-reading", userId],
    queryFn: async () => {
      //1. Find this user's active plan enrollment
      const { data: userPlan, error: userPlanError } = await supabase
        .from("user_plans")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (userPlanError) throw userPlanError;

      //2. Work out which dat number "today" correspond to
      const dayNumber =
        differenceInCalendarDays(new Date(), new Date(userPlan.start_date)) + 1;
        console.log("Computer dayNumber:", dayNumber, "start_date", userPlan.start_date); 

      //3. Fetch that specific day's scripture reference
      const { data: planDay, error: planDayError } = await supabase
        .from("plan_days")
        .select("*")
        .eq("plan_id", userPlan.plan_id)
        .eq("day_number", dayNumber)
        .single();

      if (planDayError) throw planDayError;

      return { userPlan, planDay };
    },

    enabled: !!userId,
  });
};
