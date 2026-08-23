import { useProfile } from "../auth/useProfile";
import { useTodayReading } from "./useTodaysReading";
import { useMarkComplete } from "./useMarkComplete";
import { useState } from "react";
import { useVerse } from "./useVerse";

export const DashboardPage = () => {
  const { data: profile } = useProfile();
  const { data, isLoading, error } = useTodayReading();
  const markComplete = useMarkComplete();
  const [showFullPassage, setShowFullPassage] = useState(false);

  if (isLoading) {
    return <p className="p-6 text-gray-500">Loading...</p>;
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">
          Welcome, {profile?.name ?? profile?.username}
        </h1>
        <p className="mt-4 text-gray-500">No active reading plan found.</p>
      </div>
    );
  }

  const { planDay } = data;
  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">
        Welcome, {profile?.name ?? profile?.username}
      </h1>
      <div className="mt-6 rounded-lg border border-gray-200 p-6 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-gray-500">
          Day {planDay.day_number}
        </p>
        <h2 className="mt-2 text-xl font-semibold">
          {planDay.chapter_1_reference} & {planDay.chapter_2_reference}
        </h2>

        <MemoryVerse reference={planDay.memory_verse_reference} />

        <button
          onClick={() => setShowFullPassage((prev) => !prev)}
          className="mt-4 text-sm text-gray-700 underline"
        >
          {showFullPassage ? "Hide full passage" : "Read full passage"}
        </button>

        {showFullPassage && (
          <FullPassage
            chapter1={planDay.chapter_1_reference}
            chapter2={planDay.chapter_2_reference}
          />
        )}

        <button
          onClick={() => markComplete.mutate(planDay.id)}
          disabled={markComplete.isPending}
          className="mt-6 w-full rounded-md bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {markComplete.isPending ? "Saving..." : "Mark as read"}
        </button>

        {markComplete.isSuccess && (
          <p className="mt-3 text-sm text-green-700">Marked Complete!</p>
        )}
      </div>
    </div>
  );
};

const MemoryVerse = ({ reference }: { reference: string }) => {
  const { data: verse, isLoading } = useVerse(reference);

  return (
    <div className="mt-4 rounded-md bg-gray-50 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        Memory verse
      </p>{" "}
      {isLoading ? (
        <p className="mt-1 text-sm text-gray-400">Loading...</p>
      ) : (
        <p className="mt-1 italic text-gray-800">
          {verse?.text.trim()} - {verse?.reference}
        </p>
      )}
    </div>
  );
};

const FullPassage = ({
  chapter1,
  chapter2,
}: {
  chapter1: string;
  chapter2: string;
}) => {
  const { data: ch1, isLoading: loading1 } = useVerse(chapter1);
  const { data: ch2, isLoading: loading2 } = useVerse(chapter2);

  if (loading1 || loading2) {
    return <p className="mt-4 text-sm text-gray-400">Loading passage...</p>;
  }

  return (
    <div className="mt-4 space-y-4 text-sm  leading-relaxed text-gray-800">
      <VerseBlock title={ch1?.reference} verses={ch1?.verses} />
      <VerseBlock title={ch2?.reference} verses={ch2?.verses} />
    </div>
  );
};

const VerseBlock = ({
  title,
  verses,
}: {
  title: string | undefined;
  verses: { verse: number; text: string }[] | undefined;
}) => {
  return (
    <div>
      <p className="font-semibold">{title}</p>
      <p>
        {verses?.map((v) => (
          <span key={v.verse}>
            <sup className="mr-0.5 text-xs text-gray-500">{v.verse}</sup>
            {v.text.trim()}{" "}
          </span>
        ))}
      </p>
    </div>
  );
};
