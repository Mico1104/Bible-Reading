import { StatusBadge } from "./StatusBadge";

type ReadingCardProps = {
  dayNumber: number;
  scriptureReference: string;
};

export const ReadingCard = ({
  dayNumber,
  scriptureReference,
}: ReadingCardProps) => {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 p-6 shadow-sm">
      <p className="text-sm uppercase tracking-wide text-gray-500">
        Day {dayNumber}
      </p>
      <h1 className="mt-2 text-2xl font-semibold">{scriptureReference}</h1>
      <StatusBadge isComplete={true} />
      <button className="mt-6 rounded-md bg-gray-900 px-4 py-2 text-white">
        Mark as read
      </button>
    </div>
  );
};
