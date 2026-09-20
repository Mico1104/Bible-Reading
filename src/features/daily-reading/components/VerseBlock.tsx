import { motion } from "motion/react";
import { BookMarked } from "lucide-react";

export const VerseBlock = ({
  title,
  verses,
  translation,
  isBookmarked,
  toggleBookmark,
}: {
  title: string | undefined;
  verses: { verse: number; text: string }[] | undefined;
  translation: string;
  isBookmarked: (reference: string, translation: string) => boolean;
  toggleBookmark: (reference: string, translation: string) => Promise<boolean>;
}) => {
  return (
    <motion.article
      className="relative overflow-hidden rounded-2xl border border-(--border) bg-(--card-verse) p-4 shadow-sm sm:p-5"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
    >
      <p className="relative font-display text-xl text-(--primary)">{title}</p>

      <div className="relative mt-3 space-y-3 text-[15px] leading-8 tracking-[0.01em] text-(--text-soft)">
        {verses?.map((v) => {
          const reference = `${title}:${v.verse}`;
          const bookmarked = isBookmarked(reference, translation);

          return (
            <div key={v.verse} className="group flex items-start gap-2.5">
              <span className="flex-1 min-w-0">
                <sup className="mr-1 text-[10px] font-semibold text-(--primary)">
                  {v.verse}
                </sup>
                {v.text.trim()}
              </span>

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
                title={bookmarked ? "Remove bookmark" : "Bookmark verse"}
                whileTap={{ scale: 0.92 }}
                className={`mt-1 shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/35 ${
                  bookmarked
                    ? "border-(--primary)/25 bg-(--primary)/10 text-(--primary) shadow-sm"
                    : "border-(--border) bg-(--surface) text-(--muted-strong) hover:border-(--primary)/30 hover:bg-(--surface-strong) hover:text-(--primary)"
                }`}
              >
                <BookMarked
                  size={17}
                  fill={bookmarked ? "currentColor" : "none"}
                  strokeWidth={bookmarked ? 2.4 : 2}
                  className={
                    bookmarked ? "drop-shadow-[0_0_0_rgba(0,0,0,0)]" : ""
                  }
                />
              </motion.button>
            </div>
          );
        })}
      </div>
    </motion.article>
  );
};
