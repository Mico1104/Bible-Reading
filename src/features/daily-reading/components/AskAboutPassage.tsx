import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAskAboutPassage } from "../useAskAboutPassage";
import { AiResponse } from "./AiResponse";
import { Sparkles, X, Send } from "lucide-react";

export const AskAboutPassage = ({
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