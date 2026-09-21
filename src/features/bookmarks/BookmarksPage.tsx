import { useBookmarks } from "@/hooks/useBookmarks";
import {
  getTranslationName,
  getTranslationProvider,
} from "@/lib/bibleTranslations";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Bookmark,
  BookMarked,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

export const BookmarksPage = () => {
  const { bookmarks, loading, removeBookmark } = useBookmarks();

  const handleRemove = async (bookmarkId: string) => {
    try {
      await removeBookmark(bookmarkId);
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-0">
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
            <BookMarked size={22} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--muted)">
              Saved verses
            </p>

            <h1 className="mt-2 font-display text-3xl text-(--text) sm:text-4xl">
              Bookmarks
            </h1>

            <p className="mt-2 text-sm text-(--muted-strong)">
              Verses you want to revisit and remember.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton-line h-24 rounded-2xl" />
          <div className="skeleton-line h-24 rounded-2xl" />
          <div className="skeleton-line h-24 rounded-2xl" />
        </div>
      ) : bookmarks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.75rem] border border-(--border) bg-(--surface) px-5 py-10 text-center shadow-sm sm:px-8"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-(--primary)/10 text-(--primary)">
            <Bookmark size={30} />
          </div>

          <h2 className="mt-5 font-display text-2xl text-(--text)">
            You haven't saved any verses yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-(--muted-strong)">
            Save the verses that stand out to you during today's
            reading and they will appear here for easy revisiting.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-(--primary) px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(117,73,60,0.18)] transition hover:bg-(--primary-strong)"
          >
            Back to dashboard
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-3">
            {bookmarks.map((bookmark) => {
              const provider = getTranslationProvider(
                bookmark.translation,
              );

              const translationName = getTranslationName(
                bookmark.translation,
                provider,
              );

              const passageUrl = `/passage/${encodeURIComponent(
                bookmark.reference,
              )}?translation=${encodeURIComponent(
                bookmark.translation,
              )}&provider=${encodeURIComponent(provider)}`;

              return (
                <motion.article
                  key={bookmark.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between gap-3 rounded-3xl border border-(--border) bg-(--card-verse) p-4 shadow-sm sm:p-4"
                >
                  <Link
                    to={passageUrl}
                    className="min-w-0 flex-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/40"
                  >
                    <h2 className="font-display text-xl font-semibold text-(--primary) transition hover:text-(--primary-strong)">
                      {bookmark.reference}
                    </h2>

                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--muted)">
                      {translationName}
                    </p>
                  </Link>

                  <button
                    type="button"
                    onClick={() => void handleRemove(bookmark.id)}
                    aria-label={`Remove ${bookmark.reference} bookmark`}
                    title="Remove bookmark"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-(--muted-strong) transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/35"
                  >
                    <Trash2 size={17} />
                  </button>
                </motion.article>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </main>
  );
};