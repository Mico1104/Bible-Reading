import { useProfile } from "../auth/useProfile";
import { useTodayReading } from "./useTodaysReading";
import { useMarkComplete } from "./useMarkComplete";
import { Modal } from "@/components/Modal";
import { useEffect, useRef, useState, Fragment } from "react";
import { useVerse, useVerses } from "./useVerse";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Send,
  X,
  Pause,
  Play,
  Square,
} from "lucide-react";
import { BookMarked, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { seededRandomIndex } from "@/lib/random";
import { OnboardingContent } from "./OnboardingContent";
import {
  getCompletionPercentage,
  getCompletedPasses,
} from "@/features/progress/insights";

import { REFLECTION_PROMPTS } from "./reflectionPrompts";
import { useSpeech } from "./useSpeech";
import { useAskAboutPassage } from "./useAskAboutPassage";
import { OnboardingTour } from "./OnboardingTour";
import { useAuthStore } from "@/stores/authStore";

export const DashboardPage = () => {
  const { data: profile } = useProfile();
  const userId = useAuthStore((state) => state.user?.id);
  const translation = profile?.bible_translation ?? "web";
  const translationProvider = profile?.translation_provider ?? "bible-api-com";

  const { data, isLoading, error } = useTodayReading();
  const markComplete = useMarkComplete();
  const [showFullPassage, setShowFullPassage] = useState(false);
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [isTourDismissed, setIsTourDismissed] = useState(false);

  const chapters = data?.chapters ?? [];
  const daysNumber = data?.daysNumber ?? 0;

  const references = chapters.map((c) => c.reference);

  const { data: fetchedChapters } = useVerses(
    references,
    translation,
    translationProvider,
  );

  const { data: englishChapters } = useVerses(
    references,
    "web",
    "bible-api-com",
  );

  const responseLanguage =
    translationProvider === "api-bible"
      ? translation === "b8d1feac6e94bd74-01"
        ? "Yoruba"
        : translation === "a36fc06b086699f1-02"
          ? "Igbo"
          : translation === "0ab0c764d56a715d-02"
            ? "Hausa"
            : "English"
      : "English";

  if (data?.notStartedYet) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <h1 className="font-display text-2xl">Almost there</h1>
        <p>
          Your reading plan begins on{" "}
          {new Date(data.startDate).toLocaleDateString()}.
        </p>
      </div>
    );
  }

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
          Preparing today's reading...
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

  // const { chapters, daysNumber } = data;
  const memoryChapter = chapters[daysNumber % chapters.length];
  const completePercentage = getCompletionPercentage(
    daysNumber,
    chapters.length,
  );
  const completePasses = getCompletedPasses(daysNumber, chapters.length);

  const promptIndex = seededRandomIndex(
    daysNumber + 100,
    REFLECTION_PROMPTS.length,
  );
  const todaysPrompt = REFLECTION_PROMPTS[promptIndex];

  const headerText = fetchedChapters
    ? fetchedChapters.map((c) => c.reference).join(" & ")
    : chapters.map((c) => c.reference).join(" & ");

  return (
    <>
      <motion.div
        className="content-width page-shell flex flex-col justify-center py-8 sm:py-12"
        data-onboarding="dashboard-header"
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
          data-onboarding="todays-reading"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
        >
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-(--primary)">
            <BookOpen size={16} />
            Day {daysNumber}
          </p>
          <h2 className="font-display mt-3 text-2xl text-(--text) sm:text-3xl">
            {headerText}
          </h2>

          <MemoryVerse
            chapterReference={memoryChapter.reference}
            seed={daysNumber}
            translation={translation}
            translationProvider={translationProvider}
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
            {showFullPassage && (
              <FullPassage
                fetchedChapters={fetchedChapters}
                isLoading={!fetchedChapters}
                translationProvider={translationProvider}
              />
            )}
          </AnimatePresence>

          <button
            data-onboarding="mark-as-read"
            onClick={() => markComplete.mutate(daysNumber)}
            disabled={markComplete.isPending}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-(--primary) px-4 py-3 font-semibold text-white transition hover:bg-(--primary-strong) disabled:opacity-50"
          >
            <Check size={17} />
            {markComplete.isPending ? "Saving..." : "Mark as read"}
          </button>

          {markComplete.isSuccess && (
            <p className="mt-3 text-sm text-(--success)">Marked Complete!</p>
          )}
        </motion.div>
        <p data-onboarding="progress" className="mt-2 text-sm text-(--muted)">
          {completePasses > 0
            ? `You've read through the Bible ${completePasses} time${completePasses > 1 ? "s" : ""}, and you're ${completePercentage}% through your current pass.`
            : `You're ${completePercentage}% through the Bible`}
        </p>
        <AskAboutPassage
          englishChapters={englishChapters}
          responseLanguage={responseLanguage}
          isOpen={isAskOpen}
          onOpen={() => setIsAskOpen(true)}
          onClose={() => setIsAskOpen(false)}
        />
        <div
          data-onboarding="reflection"
          className="mt-6 rounded-xl border border-(--border) bg-(--surface) p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-(--primary)">
            Reflect
          </p>
          <p className="mt-2 text-(--muted-strong)">{todaysPrompt}</p>
        </div>
      </motion.div>
      {userId &&
        profile?.onboarding_completed === false &&
        !isTourDismissed && (
          <OnboardingTour
            userId={userId}
            onClose={() => setIsTourDismissed(true)}
          />
        )}
    </>
  );
};

const MemoryVerse = ({
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
      className="mt-6 rounded-xl border border-(--border) bg-(--card-verse) p-5"
    >
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-(--primary)">
        <Sparkles size={14} />
        Memory verse
      </p>
      {isLoading ? (
        <p className="mt-1 text-sm text-(--muted)">Loading...</p>
      ) : (
        <p className="mt-2 font-display text-lg leading-7 text-(--text)">
          {verse.text.trim()} - {chapter.reference}:{verse.verse}
        </p>
      )}
    </div>
  );
};

const FullPassage = ({
  fetchedChapters,
  isLoading,
  translationProvider,
}: {
  fetchedChapters:
    | { reference: string; verses: { verse: number; text: string }[] }[]
    | undefined;
  isLoading: boolean;
  translationProvider: string;
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
      .map((chapter) => chapter.verses.map((v) => v.text).join(" "))
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
      className="mt-6 space-y-5 border-t border-(--border) pt-5 text-sm leading-relaxed text-(--muted-strong)"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      {translationProvider === "bible-api-com" && (
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayToggle}
            disabled={isPreparing || !voicesReady}
            className="flex items-center gap-2 rounded-lg bg-(--primary) px-4 py-2 text-sm font-semibold text-white"
          >
            {isSpeaking && !isPaused ? <Pause size={16} /> : <Play size={16} />}
            {!voicesReady
              ? "Loading voices..."
              : isPreparing
                ? "Loading..."
                : isSpeaking && !isPaused
                  ? "Pause"
                  : isPaused
                    ? "Resume"
                    : "Listen"}{" "}
          </button>
          {isSpeaking && (
            <button onClick={stop} className="text-sm text-(--muted)">
              <Square size={14} />
            </button>
          )}
        </div>
      )}

      {translationProvider === "api-bible" && (
        <p className="mt-2 text-xs text-(--muted)">
          Audio playback isn't support on this browser.
        </p>
      )}

      {fetchedChapters.map((chapter) => (
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
      className="relative overflow-hidden rounded-xl bg-(--card-verse) p-5 sm:p-6"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
    >
      <BookMarked
        className="absolute right-4 top-4 text-(--surface-muted)"
        size={28}
      />
      <p className="relative font-display text-xl text-(--primary)">{title}</p>
      <p className="relative mt-3 text-[15px] leading-8 text-(--text-soft)">
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

const AskAboutPassage = ({
  englishChapters,
  responseLanguage,
  isOpen,
  onOpen,
  onClose,
}: {
  englishChapters:
    | { reference: string; verses: { verse: number; text: string }[] }[]
    | undefined;
  responseLanguage: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) => {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<
    { question: string; answer: string }[]
  >([]);
  const [failedQuestion, setFailedQuestion] = useState("");
  const ask = useAskAboutPassage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const passageReference = englishChapters
    ?.map((chapter) => chapter.reference)
    .join(" & ");

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [conversation.length, ask.isPending, isOpen]);

  const handleAsk = (questionToAsk = question) => {
    const trimmedQuestion = questionToAsk.trim();
    if (!englishChapters || !trimmedQuestion || ask.isPending) return;

    const passageText = englishChapters
      .map((c) => `${c.reference}: ${c.verses.map((v) => v.text).join(" ")}`)
      .join("\n\n");

    setFailedQuestion("");

    setConversation((prev) => [
      ...prev,
      { question: trimmedQuestion, answer: "" },
    ]);

    setQuestion("");

    ask.mutate(
      {
        question: trimmedQuestion,
        passageText,
        passageReference: passageReference ?? "",
        responseLanguage,
      },
      {
        onSuccess: (answer) => {
          setConversation((prev) => {
            if (prev.length === 0) return prev;

            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              answer,
            };

            return updated;
          });
        },
        onError: () => setFailedQuestion(trimmedQuestion),
      },
    );
  };

  return (
    <>
      <motion.button
        data-onboarding="ask-about-passage"
        type="button"
        onClick={onOpen}
        className="mt-6 flex w-full items-center justify-between gap-4 rounded-xl border border-(--border) bg-(--surface) p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-(--primary) hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(--background) sm:p-5"
        whileTap={{ scale: 0.99 }}
        aria-haspopup="dialog"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--surface-muted) text-(--primary)">
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-(--text)">
              Ask about today's passage
            </span>
            <span className="mt-1 block text-sm text-(--muted-strong)">
              Explore today's reading with questions and reflection.
            </span>
          </span>
        </span>
        <span className="shrink-0 text-sm font-semibold text-(--primary)">
          Ask
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-(--overlay) p-0 backdrop-blur-sm sm:items-center sm:p-4"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) onClose();
            }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="ask-passage-title"
              className="flex max-h-dvh w-full flex-col overflow-hidden rounded-t-3xl border border-(--border) bg-(--surface) text-(--text) shadow-[0_18px_50px_var(--shadow)] sm:max-w-2xl sm:rounded-3xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
            >
              <header className="flex items-start justify-between gap-4 border-b border-(--border) p-5 sm:p-6">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--surface-muted) text-(--primary)">
                    <Sparkles size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <h2
                      id="ask-passage-title"
                      className="font-display text-xl sm:text-2xl"
                    >
                      Ask About Today's Passage
                    </h2>
                    <p className="mt-1 text-sm text-(--muted-strong)">
                      Explore today's reading with questions and reflection.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close passage questions"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full text-(--muted-strong) hover:bg-(--surface-muted) hover:text-(--text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
                >
                  <X size={19} aria-hidden="true" />
                </button>
              </header>

              <div className="border-b border-(--border) bg-(--surface-muted) px-5 py-3 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-(--muted)">
                  Today's passage
                </p>
                <p className="mt-1 text-sm font-semibold text-(--text)">
                  {passageReference ?? "Today's reading"}
                </p>
              </div>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
                {conversation.length === 0 && !ask.isPending ? (
                  <div className="py-3 text-center sm:py-6">
                    <p className="font-display text-xl text-(--text)">
                      Have a question about today's reading?
                    </p>
                    <div className="mx-auto mt-5 grid max-w-lg gap-2 text-left">
                      {[
                        "What is the main message of this passage?",
                        "What can I learn from this passage?",
                        "Which verse stands out most?",
                        "What does this passage teach about God?",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleAsk(suggestion)}
                          className="rounded-xl border border-(--border) bg-(--surface) px-4 py-3 text-left text-sm text-(--text-soft) transition hover:border-(--primary) hover:bg-(--surface-muted) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    {conversation.map((entry, index) => (
                      <article
                        key={`${entry.question}-${index}`}
                        className="space-y-3"
                      >
                        <div className="ml-8 rounded-2xl rounded-tr-md bg-(--primary) px-4 py-3 text-sm text-white">
                          <p
                            className="mb-1 text-xs font
                        -semibold uppercase tracking-wide text-white/75"
                          >
                            You
                          </p>
                          <p>{entry.question}</p>
                        </div>
                        {/* Ai response*/}
                        <div className="mr-8 rounded-2xl rounded-tl-md border border-(--border) bg-(--surface-muted) px-4 py-3 text-sm leading-6 text-(--text-soft)">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-(--primary)">
                            WordAI
                          </p>
                          {entry.answer ? (
                            <div className="leading-6 text-(--muted-strong)">
                              <AiResponse text={entry.answer} />
                            </div>
                          ) : ask.isPending &&
                            index === conversation.length - 1 ? (
                            <div className="flex items-center gap-2 text-(--muted-strong)">
                              <span>Thinking</span>
                              <span className="flex gap-1">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--primary)" />
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--primary) [animation-delay:150ms]" />
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--primary) [animation-delay:300ms]" />
                              </span>
                            </div>
                          ) : (
                            <p>
                              ! Couldn't generate a response. Please try again
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {failedQuestion && (
                  <div className="rounded-xl border border-(--danger) bg-(--surface-muted) p-4 text-sm">
                    <p className="text-(--text)">
                      Sorry, I couldn't answer that right now. Please try again.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAsk(failedQuestion)}
                      className="mt-2 font-semibold text-(--primary) underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
                    >
                      Try again
                    </button>
                  </div>
                )}
              </div>

              <form
                className="border-t border-(--border) bg-(--surface) p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:p-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleAsk();
                }}
              >
                <div className="flex items-end gap-2 rounded-2xl border border-(--border) bg-(--surface-muted) p-2 focus-within:border-(--primary) focus-within:ring-2 focus-within:ring-(--primary)/25">
                  <textarea
                    ref={inputRef}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleAsk();
                      }
                    }}
                    rows={1}
                    placeholder="Ask something about today's passage..."
                    aria-label="Question about today's passage"
                    className="max-h-32 min-h-11 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2.5 text-[15px] leading-6 text-(--text) outline-none placeholder:text-(--muted)"
                  />
                  <button
                    type="submit"
                    disabled={ask.isPending || !question.trim()}
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--primary) text-white transition hover:bg-(--primary-strong) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={
                      ask.isPending
                        ? "WordAI is thinking"
                        : "Ask about today's passage"
                    }
                  >
                    {ask.isPending ? (
                      <span
                        className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        aria-hidden="true"
                      />
                    ) : (
                      <Send size={17} aria-hidden="true" />
                    )}
                  </button>
                </div>
                <p className="mt-2 px-2 text-xs text-(--muted)">
                  Enter to ask · Shift+Enter for a new line
                </p>
              </form>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const AiResponse = ({ text }: { text: string }) => {
  const lines = text.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          return <div key={index} className="h-1" />;
        }

        // Headings
        if (trimmedLine.startsWith("### ")) {
          return (
            <p key={index} className="font-semibold text-(--text)">
              {formatInlineMarkdown(trimmedLine.slice(4))}
            </p>
          );
        }

        if (trimmedLine.startsWith("## ")) {
          return (
            <p key={index} className="font-semibold text-base text-(--text)">
              {formatInlineMarkdown(trimmedLine.slice(3))}
            </p>
          );
        }

        if (trimmedLine.startsWith("# ")) {
          return (
            <p key={index} className="font-display text-lg text-(--text)">
              {formatInlineMarkdown(trimmedLine.slice(2))}
            </p>
          );
        }

        // Bullet points
        if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
          return (
            <div key={index} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-(--primary)" />
              <p className="min-w-0 flex-1">
                {formatInlineMarkdown(trimmedLine.slice(2))}
              </p>
            </div>
          );
        }

        // Numbered lists
        const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);

        if (numberedMatch) {
          return (
            <div key={index} className="flex gap-2">
              <span className="shrink-0 font-semibold text-(--primary)">
                {numberedMatch[1]}.
              </span>
              <p className="min-w-0 flex-1">
                {formatInlineMarkdown(numberedMatch[2])}
              </p>
            </div>
          );
        }

        // Normal paragraph
        return <p key={index}>{formatInlineMarkdown(trimmedLine)}</p>;
      })}
    </div>
  );
};

const formatInlineMarkdown = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-(--surface) px-1.5 py-0.5 text-xs"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
};
