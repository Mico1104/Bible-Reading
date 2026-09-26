import { useVerse } from "../useVerse";
import { seededRandomIndex } from "@/lib/random";
import { Sparkles } from "lucide-react";

export const MemoryVerse = ({
  chapterReference,
  seed,
  translation,
  translationProvider,
}: {
  chapterReference: string;
  seed: number;
  translation: string;
  translationProvider: string;
}) => {
  const { data: chapter, isLoading } = useVerse(
    chapterReference,
    translation,
    translationProvider,
  );

  if (isLoading || !chapter) {
    return (
      <div className="mt-6 rounded-xl border border-(--border) bg-(--card-verse) p-5">
        <p className="text-sm text-(--muted)">Loading…</p>
      </div>
    );
  }

  const index = seededRandomIndex(seed, chapter.verses.length);
  const verse = chapter.verses[index];

  return (
    <div
      data-onboarding="memory-verse"
      className="mt-6 overflow-hidden rounded-2xl border border-(--border) bg-(--card-verse) shadow-sm"
    >
      <div className="border-b border-(--border) px-4 py-3 sm:px-5">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-(--primary)">
          <Sparkles size={14} />
          Memory verse
        </p>
      </div>

      {isLoading ? (
        <div className="p-5">
          <p className="text-sm text-(--muted)">Loading...</p>
        </div>
      ) : (
        <div className="p-5 sm:p-6">
          <blockquote className="max-w-2xl font-display text-xl leading-8 text-(--text) italic sm:text-2xl sm:leading-9">
            “{verse.text.trim()}”
          </blockquote>

          <p className="mt-5 text-sm font-semibold text-(--muted-strong)">
            <span className="text-(--primary)">Verse {verse.verse}</span>
            <span className="mx-2 text-(--border-strong)">|</span>
            {chapter.reference}
          </p>
        </div>
      )}
    </div>
  );
};
