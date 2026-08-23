import { useProfile } from "../auth/useProfile";
import { useTodayReading } from "./useTodaysReading";

export const DashboardPage = () => {
  const { data: profile } = useProfile();
  const { data, isLoading, error } = useTodayReading();
  console.log("Today's reading error:", error);
  console.log("Today's reading data:", data);

  if (isLoading) {
    return <p className="p-6 text-gray-500">Loading...</p>;
  }

  if (error || !data) {
    return (
      <div>
        <h1>Welcome, {profile?.name ?? profile?.username}</h1>
        <p>No active reading plan found.</p>
      </div>
    );
  }

  const { planDay } = data;
  return (
    <div>
      <h1>Welcome, {profile?.name ?? profile?.username}</h1>
      <div>
        <p>Day {planDay.day_number}</p>
        <h2>{planDay.scripture_reference}</h2>
      </div>
    </div>
  );
};
