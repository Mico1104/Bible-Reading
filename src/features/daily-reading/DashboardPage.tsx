import { useProfile } from "../auth/useProfile";
import { useTodayReading } from "./useTodaysReading";
import { useMarkComplete } from "./useMarkComplete";
import { useState } from "react";
import { useVerse } from "./useVerse";
import { BookOpen, Check, ChevronDown, ChevronUp } from "lucide-react";
import { BookMarked, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCreatePlan } from "./useCreatePlan";

export const DashboardPage = () => {
  const { data: profile } = useProfile();
  const { data, isLoading, error } = useTodayReading();
  const markComplete = useMarkComplete();
  const [showFullPassage, setShowFullPassage] = useState(false);

  console.log(data);

  if (isLoading) {
    return (
      <motion.div
        className="content-width page-shell flex flex-col justify-center py-8 sm:py-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="animate-pulse-soft max-w-3xl rounded-2xl border border-[#e9e0db] bg-white p-5 shadow-sm sm:p-8">
          <div className="skeleton-line h-4 w-24" />
          <div className="skeleton-line mt-5 h-10 max-w-md" />
          <div className="skeleton-line mt-8 h-28" />
          <div className="skeleton-line mt-6 h-12" />
        </div>
        <p className="mx-auto mt-5 text-center text-sm text-[#9b8d88]">
          Preparing today&apos;s reading...
        </p>
      </motion.div>
    );
  }

  if (error || !data) {
    return <OnboardingPrompt />;
  }

  const { chapters, daysNumber } = data;
  const [chapter1, chapter2] = chapters;
  const memoryVerseReference = `${chapter1.reference}:1`;
  return (
    <motion.div
      className="content-width page-shell flex flex-col justify-center py-8 sm:py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9b8d88]">
        Welcome back
      </p>
      <h1 className="font-display mt-2 text-4xl">
        Welcome, {profile?.name ?? profile?.username}
      </h1>
      <motion.div
        className="mt-8 max-w-3xl rounded-2xl border border-[#e9e0db] bg-white p-5 shadow-sm sm:p-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.45 }}
      >
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#75493c]">
          <BookOpen size={16} />
          Day {daysNumber}
        </p>
        <h2 className="font-display mt-3 text-2xl sm:text-3xl">
          {chapter1.reference} & {chapter2.reference}
        </h2>

        <MemoryVerse reference={memoryVerseReference} />

        <button
          onClick={() => setShowFullPassage((prev) => !prev)}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#75493c]"
        >
          {showFullPassage ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
          {showFullPassage ? "Hide full passage" : "Read full passage"}
        </button>

        <AnimatePresence initial={false}>
          {showFullPassage && (
            <FullPassage
              chapter1={chapter1.reference}
              chapter2={chapter2.reference}
            />
          )}
        </AnimatePresence>

        <button
          onClick={() => markComplete.mutate(daysNumber)}
          disabled={markComplete.isPending}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#75493c] px-4 py-3 font-semibold text-white transition hover:bg-[#603a31] disabled:opacity-50"
        >
          <Check size={17} />
          {markComplete.isPending ? "Saving..." : "Mark as read"}
        </button>

        {markComplete.isSuccess && (
          <p className="mt-3 text-sm text-green-700">Marked Complete!</p>
        )}
      </motion.div>
    </motion.div>
  );
};

const MemoryVerse = ({ reference }: { reference: string }) => {
  const { data: verse, isLoading } = useVerse(reference);

  return (
    <div className="mt-6 rounded-xl border border-[#eadbd5] bg-[#f7f4f1] p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#75493c]">
        <Sparkles size={14} />
        Memory verse
      </p>
      {isLoading ? (
        <p className="mt-1 text-sm text-gray-400">Loading...</p>
      ) : (
        <p className="mt-2 font-display text-lg leading-7 text-[#0f151f]">
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
    return (
      <motion.div
        className="mt-6 border-t border-[#e9e0db] pt-5"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
      >
        <div className="skeleton-line h-5 w-40" />
        <div className="skeleton-line mt-3 h-20" />
        <p className="mt-4 text-sm text-[#9b8d88]">
          Opening the full passage...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mt-6 space-y-5 border-t border-[#e9e0db] pt-5 text-sm leading-relaxed text-[#7e6862]"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      <VerseBlock title={ch1?.reference} verses={ch1?.verses} />
      <VerseBlock title={ch2?.reference} verses={ch2?.verses} />
    </motion.div>
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
    <motion.article
      className="relative overflow-hidden rounded-xl bg-[#f7f4f1] p-5 sm:p-6"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
    >
      <BookMarked className="absolute right-4 top-4 text-[#eadbd5]" size={28} />
      <p className="relative font-display text-xl text-[#75493c]">{title}</p>
      <p className="relative mt-3 text-[15px] leading-8">
        {verses?.map((v) => (
          <span key={v.verse} className="verse-line">
            <sup className="mr-1 text-xs font-semibold text-[#75493c]">
              {v.verse}
            </sup>
            {v.text.trim()}{" "}
          </span>
        ))}
      </p>
    </motion.article>
  );
};

const OnboardingPrompt = () => {
  const createPlan = useCreatePlan();

  return (
    <div className="mx-auto max-w-md p-6 text-center">
      <h1 className="font-display text-3xl">Where would you like to start?</h1>
      <p className="mt-3 text-[#7e6862]">
        Choose whether to begin in the Old Testament or the New Testament —
        you'll read straight through, looping back around once you finish.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={() => createPlan.mutate("OT")}
          disabled={createPlan.isPending}
          className="rounded-lg bg-[#75393c] px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          Start in the Old Testament
        </button>
        <button
          onClick={() => createPlan.mutate("NT")}
          disabled={createPlan.isPending}
          className="rounded-lg border border-[#75493c] px-4 py-3 font-semibold text-[#75493c] disabled:opacity-50"
        >
          Start in the New Testament
        </button>
      </div>
    </div>
  );
};
