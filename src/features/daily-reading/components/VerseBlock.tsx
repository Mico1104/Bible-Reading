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
            <div key={v.verse} className="group flex items-start gap-2">
              <span className="flex-1">
                <sup className="mr-1 text-[10px] font-semibold text-(--primary)">
                  {v.verse}
                </sup>
                {v.text.trim()}
              </span>

              <button
                type="button"
                onClick={() => {
                  void toggleBookmark(reference, translation);
                }}
                aria-label={
                  bookmarked
                    ? `Remove bookmark from ${reference}`
                    : `Bookmark ${reference}`
                }
                title={bookmarked ? "Remove bookmark" : "Bookmark verse"}
                className="mt-1 shrink-0 rounded-md p-1.5 text-(--surface-muted) transition hover:bg-(--surface) hover:text-(--primary)"
              >
                <BookMarked
                  size={18}
                  fill={bookmarked ? "currentColor" : "none"}
                  strokeWidth={bookmarked ? 2.5 : 2}
                />
              </button>
            </div>
          );
        })}
      </div>
    </motion.article>
  );
};