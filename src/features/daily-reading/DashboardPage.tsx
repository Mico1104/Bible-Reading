import { useProfile } from "../auth/useProfile";
import { useTodayReading } from "./useTodaysReading";
import { useMarkComplete } from "./useMarkComplete";
import { Modal } from "@/components/Modal";
import { useState } from "react";
import { useVerse, useVerses } from "./useVerse";
import { BookOpen, Check, ChevronDown, ChevronUp } from "lucide-react";
import { BookMarked, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { seededRandomIndex } from "@/lib/random";
import { OnboardingContent } from "./OnboardingContent";

export const DashboardPage = () => {
  const { data: profile } = useProfile();
  const { data, isLoading, error } = useTodayReading();
  const markComplete = useMarkComplete();
  const [showFullPassage, setShowFullPassage] = useState(false);

  if (isLoading) {
    return (
      <motion.div
        className="content-width page-shell flex flex-col justify-center py-8 sm:py-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="animate-pulse-soft max-w-3xl rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-sm sm:p-8">
          <div className="skeleton-line h-4 w-24" />
          <div className="skeleton-line mt-5 h-10 max-w-md" />
          <div className="skeleton-line mt-8 h-28" />
          <div className="skeleton-line mt-6 h-12" />
        </div>
        <p className="mx-auto mt-5 text-center text-sm text-(--muted)">
          Preparing today&apos;s reading...
        </p>
      </motion.div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <Modal isOpen={true}>
          <OnboardingContent />
        </Modal>
      </div>
    );
  }

  const { chapters, daysNumber } = data;
  const memoryChapter = chapters[daysNumber % chapters.length];
  return (
    <motion.div
      className="content-width page-shell flex flex-col justify-center py-8 sm:py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--muted)">
        Welcome back
      </p>
      <h1 className="font-display mt-2 text-4xl text-(--text)">
        Welcome, {profile?.name ?? profile?.username}
      </h1>
      <motion.div
        className="mt-8 max-w-3xl rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-sm sm:p-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.45 }}
      >
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-(--primary)">
          <BookOpen size={16} />
          Day {daysNumber}
        </p>
        <h2 className="font-display mt-3 text-2xl text-(--text) sm:text-3xl">
          {chapters.map((c) => c.reference).join("&")}
        </h2>

        <MemoryVerse
          chapterReference={memoryChapter.reference}
          seed={daysNumber}
        />

        <button
          onClick={() => setShowFullPassage((prev) => !prev)}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-(--primary)"
        >
          {showFullPassage ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
          {showFullPassage ? "Hide full passage" : "Read full passage"}
        </button>

        <AnimatePresence initial={false}>
          {showFullPassage && <FullPassage chapters={chapters} />}
        </AnimatePresence>

        <button
          onClick={() => markComplete.mutate(daysNumber)}
          disabled={markComplete.isPending}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-(--primary) px-4 py-3 font-semibold text-white transition hover:bg-(--primary-strong) disabled:opacity-50"
        >
          <Check size={17} />
          {markComplete.isPending ? "Saving..." : "Mark as read"}
        </button>

        {markComplete.isSuccess && (
          <p className="mt-3 text-sm text-[var(--success)]">Marked Complete!</p>
        )}
      </motion.div>
    </motion.div>
  );
};

const MemoryVerse = ({
  chapterReference,
  seed,
}: {
  chapterReference: string;
  seed: number;
}) => {
  const { data: chapter, isLoading } = useVerse(chapterReference);

  if (isLoading || !chapter) {
    return (
      <div className="mt-6 rounded-xl border border-(--border) bg-[var(--card-verse)] p-5">
        <p className="text-sm text-(--muted)">Loading…</p>
      </div>
    );
  }

  const index = seededRandomIndex(seed, chapter.verses.length);
  const verse = chapter.verses[index];

  return (
    <div className="mt-6 rounded-xl border border-(--border) bg-[var(--card-verse)] p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-(--primary)">
        <Sparkles size={14} />
        Memory verse
      </p>
      {isLoading ? (
        <p className="mt-1 text-sm text-(--muted)">Loading...</p>
      ) : (
        <p className="mt-2 font-display text-lg leading-7 text-(--text)">
          {verse.text.trim()} - {chapterReference}:{verse.verse}
        </p>
      )}
    </div>
  );
};

const FullPassage = ({ chapters }: { chapters: { reference: string }[] }) => {
  const references = chapters.map((c) => c.reference);
  const { data: results, isLoading } = useVerses(references);

  if (isLoading || !results) {
    return (
      <motion.div
        className="mt-6 border-t border-(--border) pt-5"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
      >
        <div className="skeleton-line h-5 w-40" />
        <div className="skeleton-line mt-3 h-20" />
        <p className="mt-4 text-sm text-(--muted)">
          Opening the full passage...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mt-6 space-y-5 border-t border-(--border) pt-5 text-sm leading-relaxed text-(--muted-strong)"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      {results.map((chapter) => (
        <VerseBlock
          key={chapter.reference}
          title={chapter.reference}
          verses={chapter.verses}
        />
      ))}
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
      className="relative overflow-hidden rounded-xl bg-[var(--card-verse)] p-5 sm:p-6"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
    >
      <BookMarked
        className="absolute right-4 top-4 text-[var(--surface-muted)]"
        size={28}
      />
      <p className="relative font-display text-xl text-(--primary)">{title}</p>
      <p className="relative mt-3 text-[15px] leading-8 text-[var(--text-soft)]">
        {verses?.map((v) => (
          <span key={v.verse} className="verse-line">
            <sup className="mr-1 text-xs font-semibold text-(--primary)">
              {v.verse}
            </sup>
            {v.text.trim()}{" "}
          </span>
        ))}
      </p>
    </motion.article>
  );
};
