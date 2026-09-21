import { VerseBlock } from "./VerseBlock";
import { useSpeech } from "../useSpeech";
import { useEffect } from "react";
import { motion } from "motion/react";
import { Pause, Play, Square } from "lucide-react";

export const FullPassage = ({
  fetchedChapters,
  canonicalReferences,
  isLoading,
  translationProvider,
  translation,
  isBookmarked,
  toggleBookmark,
}: {
  fetchedChapters:
    | {
        reference: string;
        verses: { verse: number; text: string }[];
      }[]
    | undefined;

  canonicalReferences: string[];

  isLoading: boolean;

  translationProvider: string;

  translation: string;

  isBookmarked: (
    reference: string,
    translation: string,
  ) => boolean;

  toggleBookmark: (
    reference: string,
    translation: string,
  ) => Promise<boolean>;
}) => {
  const {
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    stop,
    isPreparing,
    voicesReady,
  } = useSpeech();

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlayToggle = () => {
    if (!fetchedChapters || !voicesReady) return;

    if (isSpeaking && !isPaused) {
      pause();
      return;
    }

    if (isSpeaking && isPaused) {
      resume();
      return;
    }

    const fullText = fetchedChapters
      .map((chapter) =>
        chapter.verses.map((v) => v.text).join(" "),
      )
      .join(".Next chapter.");

    speak(fullText);
  };

  if (isLoading || !fetchedChapters) {
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
      className="mt-6 space-y-4 border-t border-(--border) pt-5 text-sm leading-relaxed text-(--muted-strong)"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: "auto" }}
    >
      {translationProvider === "bible-api-com" && (
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayToggle}
            disabled={isPreparing || !voicesReady}
            className="flex items-center gap-2 rounded-lg bg-(--primary) px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          >
            {isSpeaking && !isPaused ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}

            {!voicesReady
              ? "Loading voices..."
              : isPreparing
                ? "Loading..."
                : isSpeaking && !isPaused
                  ? "Pause"
                  : isPaused
                    ? "Resume"
                    : "Listen"}
          </button>

          {isSpeaking && (
            <button
              onClick={stop}
              className="text-sm text-(--muted)"
              aria-label="Stop playback"
              title="Stop playback"
            >
              <Square size={14} />
            </button>
          )}
        </div>
      )}

      {translationProvider === "api-bible" && (
        <p className="mt-2 text-xs text-(--muted)">
          Audio playback isn't supported on this browser.
        </p>
      )}

      <div className="reading-scroll space-y-4 pr-1">
        {fetchedChapters.map((chapter, index) => (
          <VerseBlock
            key={chapter.reference}
            title={chapter.reference}
            canonicalReference={canonicalReferences[index]}
            verses={chapter.verses}
            translation={translation}
            isBookmarked={isBookmarked}
            toggleBookmark={toggleBookmark}
          />
        ))}
      </div>
    </motion.div>
  );
};