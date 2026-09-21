import { useVerse } from "@/features/daily-reading/useVerse";
import { useProfile } from "@/features/auth/useProfile";
import {
  getTranslationName,
  getTranslationProvider,
} from "@/lib/bibleTranslations";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";

export const PassagePage = () => {
  const { reference } = useParams<{ reference: string }>();
  const [searchParams] = useSearchParams();

  const { data: profile, isLoading: isProfileLoading } = useProfile();

  const decodedReference = reference ? decodeURIComponent(reference) : "";

  /*
   * A bookmark is stored as:
   * "Mark 11:1"
   *
   * But useVerse() fetches a whole chapter, so we need:
   * "Mark 11"
   *
   * We keep the verse number separately so we can display
   * only the bookmarked verse.
   */
  const lastColonIndex = decodedReference.lastIndexOf(":");

  const chapterReference =
    lastColonIndex !== -1
      ? decodedReference.slice(0, lastColonIndex)
      : decodedReference;

  const verseNumber =
    lastColonIndex !== -1
      ? Number(decodedReference.slice(lastColonIndex + 1))
      : null;

  const savedTranslation = searchParams.get("translation");
  const savedProvider = searchParams.get("provider");

  const translation = savedTranslation ?? profile?.bible_translation ?? "web";

  const translationProvider =
    savedProvider ??
    profile?.translation_provider ??
    getTranslationProvider(translation);

  const translationName = getTranslationName(translation, translationProvider);

  const {
    data,
    isLoading: isVerseLoading,
    isError,
  } = useVerse(chapterReference || undefined, translation, translationProvider);

  const isLoading =
    isProfileLoading && !savedTranslation ? true : isVerseLoading;

  const bookmarkedVerse =
    data?.verses.find((verse) => verse.verse === verseNumber) ?? null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <Link
          to="/bookmarks"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-(--muted-strong) transition hover:bg-(--surface-strong)"
        >
          <ArrowLeft size={18} />
          Back to Bookmarks
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="skeleton-line h-8 w-48 rounded-lg" />
          <div className="skeleton-line h-40 rounded-2xl" />
        </div>
      ) : isError || !data ? (
        <div className="rounded-2xl border border-(--border) bg-(--card-verse) px-5 py-10 text-center">
          <BookOpen size={32} className="mx-auto text-(--surface-muted)" />

          <h1 className="mt-4 font-display text-xl font-semibold text-(--text)">
            Passage unavailable
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-(--muted)">
            We couldn't load this Bible passage right now. Please try again.
          </p>
        </div>
      ) : !bookmarkedVerse ? (
        <div className="rounded-2xl border border-(--border) bg-(--card-verse) px-5 py-10 text-center">
          <BookOpen size={32} className="mx-auto text-(--surface-muted)" />

          <h1 className="mt-4 font-display text-xl font-semibold text-(--text)">
            Verse unavailable
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-(--muted)">
            We found the chapter, but couldn't find verse {verseNumber} in this
            passage.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-5">
            <p className="text-sm font-medium uppercase tracking-wide text-(--muted)">
              {translationName}
            </p>

            <h1 className="mt-1 font-display text-2xl font-semibold text-(--text)">
              {decodedReference}
            </h1>
          </div>

          <article className="rounded-2xl border border-(--border) bg-(--card-verse) p-5 shadow-sm sm:p-6">
            <p className="text-[16px] leading-8 text-(--text-soft)">
              <sup className="mr-1 text-[11px] font-semibold text-(--primary)">
                {bookmarkedVerse.verse}
              </sup>

              {bookmarkedVerse.text.trim()}
            </p>
          </article>
        </>
      )}
    </main>
  );
};
