import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

type LeaderboardEntry = {
  current_streak: number;
  profiles: { username: string; name: string } | null;
};

export const useLeaderBoard = () => {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_stats")
        .select("current_streak, profiles(username, name)")
        .order("current_streak", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as unknown as LeaderboardEntry[];
    },
  });
};
