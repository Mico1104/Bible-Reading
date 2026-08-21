import { useProfile } from "../auth/useProfile";

export const DashboardPage = () => {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return <p className="p-6 text-gray-500">Loading...</p>;
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">
        Welcome, {profile?.name ?? profile?.username}
        
      </h1>
    </div>
  );
};
