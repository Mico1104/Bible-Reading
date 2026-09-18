import { useBookmarks } from "@/hooks/useBookmarks";
import { Bookmark, Trash2 } from "lucide-react";
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
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
            <Bookmark size={22} />
          </div>

          <div>
            <h1 className="font-display text-2xl font-semibold text-(--text)">
              Bookmarks
            </h1>
            <p className="text-sm text-(--muted)">
              Your saved Bible verses
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
        <div className="rounded-2xl border border-(--border) bg-(--card-verse) px-5 py-10 text-center">
          <Bookmark
            size={32}
            className="mx-auto text-(--surface-muted)"
          />

          <h2 className="mt-4 font-display text-lg font-semibold text-(--text)">
            No bookmarks yet
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-(--muted)">
            When you find a Bible verse you want to remember, tap the bookmark
            icon beside it and it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bookmark) => (
            <article
              key={bookmark.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-(--border) bg-(--card-verse) p-4 shadow-sm"
            >
              <Link
                to={`/passage/${encodeURIComponent(bookmark.reference)}`}
                className="min-w-0 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)/40"
              >
                <h2 className="font-display text-lg font-semibold text-(--primary) transition hover:underline">
                  {bookmark.reference}
                </h2>

                <p className="mt-1 text-xs uppercase tracking-wide text-(--muted)">
                  {bookmark.translation}
                </p>
              </Link>

              <button
                type="button"
                onClick={() => void handleRemove(bookmark.id)}
                aria-label={`Remove ${bookmark.reference} bookmark`}
                title="Remove bookmark"
                className="shrink-0 rounded-lg p-2 text-(--muted) transition hover:bg-(--surface) hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

