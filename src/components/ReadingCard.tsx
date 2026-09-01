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
    <div className="mx-auto max-w-md rounded-lg border border-(--border) bg-(--surface) p-6 shadow-sm">
      <p className="text-sm uppercase tracking-wide text-(--muted)">
        Day {dayNumber}
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-(--text)">{scriptureReference}</h1>
      <StatusBadge isComplete={true} />
      <button className="mt-6 rounded-md bg-(--primary) px-4 py-2 text-white transition hover:bg-(--primary-strong)">
        Mark as read
      </button>
    </div>
  );
};
