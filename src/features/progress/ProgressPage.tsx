import { calculateStreak, useProgress } from "./useProgress";

export const ProgressPage = () => {
  const { data: progress, isLoading } = useProgress();

  if (isLoading) {
    return <p className="p-6 text-gray-500">Loading...</p>;
  }

  const streak = calculateStreak(progress);
  const totalCompleted = progress?.length ?? 0;

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Your Progress</h1>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border border-gray-200 p-4 text-center">
          <p className="text-3xl font-semibold">{streak}</p>
          <p className="mt-1 text-sm text-gray-500">Day streak</p>
        </div>
        <div className="rounded-lg border border border-gray-200 p-4 text-center">
          <p className="text-3xl font-semibold">{totalCompleted}</p>
          <p className="mt-1 text-sm text-gray-500">Days completed</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          History
        </h2>
      </div>
      <ul className="mt-3 space-y-2">
        {progress?.map((entry) => (
          <li
            key={entry.id}
            className="flex justify-between rounded-md bg-gray-50 px-4 py-4 py-2 text-sm"
          >
            <span>Day {entry.pan_days?.day_number}</span>
            <span className="text-gray-500">
              {new Date(entry.completed_at).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
