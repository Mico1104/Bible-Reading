import { motion } from "motion/react";
import { BookMarked } from "lucide-react";

export const VerseBlock = ({
  title,
  canonicalReference,
  verses,
  translation,
  isBookmarked,
  toggleBookmark,
}: {
  title: string | undefined;
  canonicalReference: string | undefined;
  verses: { verse: number; text: string }[] | undefined;
  translation: string;
  isBookmarked: (reference: string, translation: string) => boolean;
  toggleBookmark: (
    reference: string,
    translation: string,
  ) => Promise<boolean>;
}) => {
  const chapterTitle = title?.replace(/:\d+(?:-\d+)?$/, "") ?? "Passage";

  return (
    <motion.article
      className="relative overflow-hidden rounded-2xl border border-(--border) bg-(--card-verse) p-5 shadow-sm sm:p-7"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative border-b border-(--border) pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--primary)">
          Chapter
        </p>
        <h3 className="mt-1 font-display text-2xl text-(--text) sm:text-3xl">
          {chapterTitle}
        </h3>
      </div>

      <div className="relative mt-5 max-w-2xl space-y-4 text-[16px] leading-8 tracking-[0.01em] text-(--text-soft) sm:text-[17px]">
        {verses?.map((v) => {
          const reference = `${canonicalReference}:${v.verse}`;
          const bookmarked = isBookmarked(reference, translation);

          return (
            <div
              key={v.verse}
              className="group flex items-start gap-3"
            >
              <p className="min-w-0 flex-1">
                <sup className="mr-2 inline-flex min-w-5 translate-y-[-0.1em] items-center justify-center rounded-full bg-(--surface-muted) px-1.5 py-0.5 align-baseline text-[10px] font-bold leading-none text-(--primary)">
                  {v.verse}
                </sup>

                {v.text.trim()}
              </p>

              <motion.button
                type="button"
                onClick={() => {
                  void toggleBookmark(reference, translation);
                }}
                aria-label={
                  bookmarked
                    ? `Remove bookmark from ${reference}`
                    : `Bookmark ${reference}`
                }
                aria-pressed={bookmarked}
                title={
                  bookmarked
                    ? "Remove bookmark"
                    : "Bookmark verse"
                }
                whileTap={{ scale: 0.92 }}
                className={`mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/35 ${
                  bookmarked
                    ? "border-(--primary)/25 bg-(--primary)/10 text-(--primary) shadow-sm"
                    : "border-(--border) bg-(--surface) text-(--muted-strong) hover:border-(--primary)/30 hover:bg-(--surface-strong) hover:text-(--primary)"
                }`}
              >
                <BookMarked
                  size={17}
                  fill={bookmarked ? "currentColor" : "none"}
                  strokeWidth={bookmarked ? 2.4 : 2}
                />
              </motion.button>
            </div>
          );
        })}
      </div>
    </motion.article>
  );
};