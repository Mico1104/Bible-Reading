import { ReadingBadge } from "@/features/points/ReadingBadge";
import { ReadingPointsCard } from "@/features/points/ReadingPointsCard";
import { useReadingPlanDays } from "@/features/reading-plans/useReadingPlanDays";
import { useReadingPlanPassages } from "../reading-plans/useReadingPlanPassage";
import { useMarkPlanDayComplete } from "@/features/reading-plans/useMarkPlanDayComplete";
import { useTodayReadingPlan } from "@/features/reading-plans/useTodayReadingPlan";
import { useProfile } from "../auth/useProfile";
import { useTodayReading } from "./useTodaysReading";
import { useMarkComplete } from "./useMarkComplete";
import { Modal } from "@/components/Modal";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useVerses, useVerse } from "./useVerse";
import { useBookmarks } from "@/hooks/useBookmarks";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Bookmark,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { seededRandomIndex } from "@/lib/random";
import { OnboardingContent } from "./OnboardingContent";
import { ProfileSetUpContent } from "./ProfileSetUpContent";
import { getCompletedPasses } from "@/features/progress/insights";

import { REFLECTION_PROMPTS } from "./reflectionPrompts";
import { OnboardingTour } from "./OnboardingTour";
import { useAuthStore } from "@/stores/authStore";
import { MemoryVerse } from "./components/MemoryVerse";
import { FullPassage } from "./components/FullPassage";
import { AskAboutPassage } from "./components/AskAboutPassage";
import { PointsHistory } from "../points/PointsHistory";

export const DashboardPage = () => {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const userId = useAuthStore((state) => state.user?.id);
  const [selectedReadingPlanDay, setSelectedReadingPlanDay] = useState<
    number | null
  >(null);

  const { data: streak } = useQuery({
    queryKey: ["current-streak", userId],
    queryFn: async () => {
      const { supabase } = await import("@/lib/supabase");

      const { data, error } = await supabase
        .from("user_stats")
        .select("current_streak")
        .eq("user_id", userId)
        .single();

      if (error) {
        throw error;
      }

      return data?.current_streak ?? 0;
    },
    enabled: !!userId,
  });

  const translation = profile?.bible_translation ?? "web";
  const translationProvider = profile?.translation_provider ?? "bible-api-com";

  const { isBookmarked, toggleBookmark } = useBookmarks();

  // ------------------------------------------------------------
  // Daily Word
  // ------------------------------------------------------------
  const { data, isLoading, error } = useTodayReading();
  const markComplete = useMarkComplete();

  // ------------------------------------------------------------
  // Reading Plan
  // ------------------------------------------------------------
  const { data: readingPlanData, isLoading: isReadingPlanLoading } =
    useTodayReadingPlan();

  const markPlanDayComplete = useMarkPlanDayComplete();
  const readingPlan = readingPlanData?.plan;
  const { data: readingPlanDaysData, isLoading: isReadingPlanDaysLoading } =
    useReadingPlanDays(readingPlanData?.userPlanId, readingPlan?.id);

  const readingPlanDay = readingPlanData?.planDay;

  const readingPlanEnrolled = readingPlanData?.enrolled ?? false;
  const readingPlanCompleted = readingPlanData?.planCompleted ?? false;
  const readingPlanDays = readingPlanDaysData?.days ?? [];
  const completedPlanDayNumbers =
    readingPlanDaysData?.completedDayNumbers ?? [];

  const currentReadingPlanDayNumber = readingPlanData?.daysNumber ?? 0;

  const nextIncompleteReadingPlanDay =
    readingPlanDays.find(
      (day) => !completedPlanDayNumbers.includes(day.day_number),
    )?.day_number ?? null;

  const selectedReadingPlanDayNumber =
    selectedReadingPlanDay ?? currentReadingPlanDayNumber;

  const selectedReadingPlanDayData =
    readingPlanDays.find(
      (day) => day.day_number === selectedReadingPlanDayNumber,
    ) ?? readingPlanDay;

  const selectedReadingPlanDayId =
    selectedReadingPlanDayData?.id ?? readingPlanDay?.id ?? null;

  const [showDailyWordPassage, setShowDailyWordPassage] = useState(false);
  const [showReadingPlanPassage, setShowReadingPlanPassage] = useState(false);
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [isTourDismissed, setIsTourDismissed] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<"profile" | "plan">(
    "profile",
  );

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

  const { data: selectedReadingPlanPassages = [] } = useReadingPlanPassages(
    selectedReadingPlanDayId,
  );

  const selectedReadingPlanReferences = (selectedReadingPlanPassages ?? []).map(
    (passage) => passage.reference,
  );

  const {
    data: selectedReadingPlanChapters,
    isLoading: isSelectedReadingPlanPassageLoading,
  } = useVerses(
    selectedReadingPlanReferences,
    translation,
    translationProvider,
  );

  const {
    data: selectedReadingPlanMemoryVerse,
    isLoading: isSelectedReadingPlanMemoryVerseLoading,
  } = useVerse(
    selectedReadingPlanDayData?.memory_verse_reference,
    translation,
    translationProvider,
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

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-(--muted-strong)">
          Loading your profile...
        </div>
      </div>
    );
  }

  if (profile?.onboarding_completed === false) {
    return (
      <div>
        <Modal isOpen={true}>
          {onboardingStep === "profile" ? (
            <ProfileSetUpContent onComplete={() => setOnboardingStep("plan")} />
          ) : (
            <OnboardingContent />
          )}
        </Modal>
      </div>
    );
  }

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
      <div className="mx-auto max-w-md p-6 text-center">
        <h1 className="font-display text-2xl">Something went wrong</h1>

        <p className="mt-2 text-sm text-(--muted-strong)">
          We couldn't load your reading for today. Please try again.
        </p>
      </div>
    );
  }

  // const { chapters, daysNumber } = data;
  const memoryChapter = chapters[daysNumber % chapters.length];
  const chaptersPerDay = chapters.length;
  const totalChaptersRead = daysNumber * chaptersPerDay;

  const completePasses = getCompletedPasses(daysNumber, chaptersPerDay);

  const chaptersInCurrentPass = totalChaptersRead - completePasses * 1189;

  const completePercentage =
    chaptersInCurrentPass === 0 && totalChaptersRead > 0
      ? 100
      : Math.round((chaptersInCurrentPass / 1189) * 100);

  const encouragement =
    completePercentage === 100
      ? "You've completed this pass. What a milestone!"
      : completePercentage >= 75
        ? "You're getting close. Stay faithful to the journey."
        : completePercentage >= 50
          ? "You're more than halfway through this pass."
          : completePercentage >= 25
            ? "You're building a meaningful rhythm. Keep going."
            : "Every chapter is a step forward.";

  const promptIndex = seededRandomIndex(
    daysNumber + 100,
    REFLECTION_PROMPTS.length,
  );

  const todaysPrompt = REFLECTION_PROMPTS[promptIndex];

  const headerText = fetchedChapters
    ? fetchedChapters.map((c) => c.reference).join(" & ")
    : chapters.map((c) => c.reference).join(" & ");

  const currentHour = new Date().getHours();

  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <>
      <motion.div
        className="content-width page-shell flex flex-col justify-center py-8 sm:py-12"
        data-onboarding="dashboard-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--muted)">
              {greeting}
            </p>

            <h1 className="font-display mt-2 text-3xl text-(--text) sm:text-4xl">
              {profile?.name ?? profile?.username}
            </h1>

            <div className="mt-3">
              <ReadingBadge size="sm" />
            </div>

            <p className="mt-2 text-sm text-(--muted-strong)">
              Ready for today's reading?
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-(--border) bg-(--surface) px-3 py-2.5 text-right shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--muted)">
              🔥 Streak
            </p>

            <p className="mt-1 text-sm font-semibold text-(--primary)">
              {streak ?? 0} day{streak === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------
            DAILY WORD
        ------------------------------------------------------------- */}
        <motion.div
          className="mt-8 max-w-3xl rounded-[1.75rem] border border-(--border) bg-(--surface) p-5 shadow-[0_16px_32px_var(--shadow)] sm:p-7"
          data-onboarding="todays-reading"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-(--surface-strong) px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-(--primary)">
              <BookOpen size={14} />
              Today's Reading
            </p>

            <span className="text-xs font-medium text-(--muted)">
              Day {daysNumber}
            </span>
          </div>

          <h2 className="font-display mt-4 text-2xl text-(--text) sm:text-3xl">
            {headerText}
          </h2>

          <p className="mt-2 text-sm text-(--muted-strong)">
            {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"}{" "}
            for today
          </p>

          <MemoryVerse
            chapterReference={memoryChapter.reference}
            seed={daysNumber}
            translation={translation}
            translationProvider={translationProvider}
          />

          <button
            data-onboarding="full-passage"
            onClick={() => setShowDailyWordPassage((prev) => !prev)}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-strong) px-3.5 py-2.5 text-sm font-semibold text-(--primary) transition hover:border-(--primary)/30 hover:bg-(--surface)"
          >
            {showDailyWordPassage ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}

            {showDailyWordPassage ? "Hide full passage" : "Read full passage"}
          </button>

          <AnimatePresence initial={false}>
            {showDailyWordPassage && (
              <FullPassage
                fetchedChapters={fetchedChapters}
                isLoading={!fetchedChapters}
                translationProvider={translationProvider}
                translation={translation}
                isBookmarked={isBookmarked}
                toggleBookmark={toggleBookmark}
                canonicalReferences={references}
              />
            )}
          </AnimatePresence>

          <button
            data-onboarding="mark-as-read"
            onClick={() => markComplete.mutate(daysNumber)}
            disabled={markComplete.isPending}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-3.5 text-base font-semibold text-white shadow-[0_8px_18px_rgba(117,73,60,0.18)] transition hover:bg-(--primary-strong) disabled:opacity-50"
          >
            <Check size={17} />

            {markComplete.isPending ? "Saving..." : "Mark as read"}
          </button>

          {markComplete.isSuccess && (
            <p className="mt-3 text-sm font-medium text-(--success)">
              Marked Complete!
            </p>
          )}
        </motion.div>

        <ReadingPointsCard />
        <PointsHistory />

        {/* ------------------------------------------------------------
            DAILY WORD PROGRESS
        ------------------------------------------------------------- */}
        <div
          data-onboarding="progress"
          className="mt-5 rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--muted)">
                Reading progress
              </p>

              <p className="mt-2 text-sm font-semibold text-(--text)">
                {chaptersInCurrentPass.toLocaleString()} of 1,189 chapters
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-xl font-semibold text-(--primary)">
                {completePercentage}%
              </p>

              <p className="text-[10px] uppercase tracking-wider text-(--muted)">
                complete
              </p>
            </div>
          </div>

          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-(--surface-strong)"
            role="progressbar"
            aria-valuenow={completePercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Bible reading progress"
          >
            <div
              className="h-full rounded-full bg-(--primary) transition-all duration-500"
              style={{ width: `${completePercentage}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-(--muted)">
              {completePasses > 0
                ? `${completePasses} Bible pass${
                    completePasses > 1 ? "es" : ""
                  } completed`
                : "Your first Bible pass"}
            </p>

            <p className="text-xs font-medium text-(--muted-strong)">
              Keep going!
            </p>
          </div>
        </div>

        <div className="mt-3 px-1">
          <p className="text-center text-sm font-medium text-(--muted-strong)">
            {encouragement}
          </p>
        </div>

        {/* ------------------------------------------------------------
            READING PLAN
            Completely separate from Daily Word
        ------------------------------------------------------------- */}
        {readingPlanEnrolled && (
          <motion.div
            className="mt-8 max-w-3xl rounded-[1.75rem] border border-(--border) bg-(--surface) p-5 shadow-[0_16px_32px_var(--shadow)] sm:p-7"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.45 }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 rounded-full bg-(--surface-strong) px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-(--primary)">
                <BookOpen size={14} />
                Reading Plan
              </p>

              {readingPlan && (
                <span className="text-xs font-medium text-(--muted)">
                  {readingPlan.duration_days} days
                </span>
              )}
            </div>

            {isReadingPlanLoading || isReadingPlanDaysLoading ? (
              <div className="mt-5 space-y-3">
                <div className="skeleton-line h-8 max-w-md" />
                <div className="skeleton-line h-4 max-w-sm" />
                <div className="skeleton-line h-24" />
              </div>
            ) : readingPlanCompleted ? (
              <div className="mt-5 rounded-2xl bg-(--surface-strong) p-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--surface) text-(--success)">
                  <Check size={24} />
                </div>

                <h2 className="font-display mt-4 text-2xl text-(--text)">
                  Plan completed
                </h2>

                <p className="mt-2 text-sm leading-6 text-(--muted-strong)">
                  You've completed this Reading Plan. Well done for staying
                  faithful to the journey.
                </p>
              </div>
            ) : readingPlan ? (
              <>
                <h2 className="font-display mt-4 text-2xl text-(--text) sm:text-3xl">
                  {readingPlan.title}
                </h2>

                <p className="mt-2 text-sm text-(--muted-strong)">
                  You are on Day {currentReadingPlanDayNumber}.
                </p>

                {/* Day selector */}
                <div className="mt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--muted)">
                    Reading days
                  </p>

                  <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                    {readingPlanDays.map((day) => {
                      const isCompleted = completedPlanDayNumbers.includes(
                        day.day_number,
                      );

                      const isFuture =
                        day.day_number > currentReadingPlanDayNumber;

                      const isSelected =
                        day.day_number === selectedReadingPlanDayNumber;

                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => {
                            if (!isFuture) {
                              setSelectedReadingPlanDay(day.day_number);
                            }
                          }}
                          disabled={isFuture}
                          className={`flex min-w-18 shrink-0 flex-col items-center rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                            isSelected
                              ? "border-(--primary) bg-(--surface-strong) text-(--primary)"
                              : isCompleted
                                ? "border-(--border) bg-(--surface-strong) text-(--success)"
                                : isFuture
                                  ? "cursor-not-allowed border-(--border) bg-(--surface) text-(--muted) opacity-50"
                                  : "border-(--border) bg-(--surface) text-(--text) hover:border-(--primary)/40"
                          }`}
                          aria-label={
                            isFuture
                              ? `Day ${day.day_number} is locked`
                              : `View Day ${day.day_number}`
                          }
                        >
                          <span className="flex items-center gap-1">
                            {isCompleted && <Check size={12} />}
                            Day {day.day_number}
                          </span>

                          <span className="mt-1 text-[10px] font-normal">
                            {isCompleted
                              ? "Completed"
                              : isFuture
                                ? "Locked"
                                : day.day_number === currentReadingPlanDayNumber
                                  ? "Today"
                                  : "Available"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedReadingPlanDayData && (
                  <>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--primary)">
                          Day {selectedReadingPlanDayData.day_number}
                        </p>

                        {selectedReadingPlanDayData.title && (
                          <h3 className="font-display mt-2 text-xl text-(--text)">
                            {selectedReadingPlanDayData.title}
                          </h3>
                        )}
                      </div>

                      {selectedReadingPlanDayData.day_number ===
                        currentReadingPlanDayNumber && (
                        <span className="rounded-full bg-(--surface-strong) px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-(--primary)">
                          Today
                        </span>
                      )}
                    </div>

                    {selectedReadingPlanDayData.focus && (
                      <div className="mt-5 rounded-2xl bg-(--surface-strong) p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--primary)">
                          Focus
                        </p>

                        <p className="mt-2 text-sm leading-6 text-(--muted-strong)">
                          {selectedReadingPlanDayData.focus}
                        </p>
                      </div>
                    )}

                    <div className="mt-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--muted)">
                        Assigned passages
                      </p>

                      {selectedReadingPlanPassages.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {selectedReadingPlanPassages.map((passage) => (
                            <div
                              key={passage.id}
                              className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--surface-strong) px-4 py-3"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--surface) text-(--primary)">
                                <BookOpen size={16} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-(--text)">
                                  {passage.reference}
                                </p>

                                {passage.label && (
                                  <p className="mt-0.5 text-xs text-(--muted)">
                                    {passage.label}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-(--muted)">
                          No passages have been assigned for this day.
                        </p>
                      )}
                    </div>
                    {selectedReadingPlanDayData.memory_verse_reference && (
                      <div className="mt-5 rounded-2xl border border-(--border) bg-(--surface-strong) p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--primary)">
                          Memory verse
                        </p>

                        {isSelectedReadingPlanMemoryVerseLoading ? (
                          <p className="mt-2 text-sm text-(--muted)">
                            Loading memory verse...
                          </p>
                        ) : selectedReadingPlanMemoryVerse ? (
                          <div className="mt-3">
                            <blockquote className="font-display text-lg italic leading-8 text-(--text)">
                              {selectedReadingPlanMemoryVerse.verses
                                .map((verse) => verse.text.trim())
                                .join(" ")}
                            </blockquote>

                            <p className="mt-4 text-xs font-semibold text-(--muted-strong)">
                              <span className="text-(--primary)">
                                Verse{" "}
                                {
                                  selectedReadingPlanMemoryVerse.verses[0]
                                    ?.verse
                                }
                              </span>
                              <span className="mx-2 text-(--border-strong)">
                                |
                              </span>
                              {selectedReadingPlanMemoryVerse.reference}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-(--muted)">
                            {selectedReadingPlanDayData.memory_verse_reference}
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowReadingPlanPassage((prev) => !prev)}
                      disabled={
                        selectedReadingPlanPassages.length === 0 ||
                        isSelectedReadingPlanPassageLoading
                      }
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--surface-strong) px-4 py-3.5 text-sm font-semibold text-(--primary) transition hover:border-(--primary)/30 hover:bg-(--surface) disabled:opacity-50"
                    >
                      {showReadingPlanPassage ? (
                        <ChevronUp size={17} />
                      ) : (
                        <ChevronDown size={17} />
                      )}

                      {isSelectedReadingPlanPassageLoading
                        ? "Loading passage..."
                        : showReadingPlanPassage
                          ? "Hide full passage"
                          : "Read full passage"}
                    </button>

                    <AnimatePresence initial={false}>
                      {showReadingPlanPassage && (
                        <FullPassage
                          fetchedChapters={selectedReadingPlanChapters}
                          isLoading={isSelectedReadingPlanPassageLoading}
                          translationProvider={translationProvider}
                          translation={translation}
                          isBookmarked={isBookmarked}
                          toggleBookmark={toggleBookmark}
                          canonicalReferences={selectedReadingPlanReferences}
                        />
                      )}
                    </AnimatePresence>

                    {nextIncompleteReadingPlanDay ===
                    selectedReadingPlanDayData.day_number ? (
                      <button
                        type="button"
                        onClick={() =>
                          markPlanDayComplete.mutate(
                            selectedReadingPlanDayData.day_number,
                          )
                        }
                        disabled={
                          markPlanDayComplete.isPending ||
                          !readingPlanData?.userPlanId
                        }
                        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-3.5 text-base font-semibold text-white shadow-[0_8px_18px_rgba(117,73,60,0.18)] transition hover:bg-(--primary-strong) disabled:opacity-50"
                      >
                        <Check size={17} />

                        {markPlanDayComplete.isPending
                          ? "Saving..."
                          : `Complete Day ${selectedReadingPlanDayData.day_number}`}
                      </button>
                    ) : completedPlanDayNumbers.includes(
                        selectedReadingPlanDayData.day_number,
                      ) ? (
                      <div className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-(--surface-strong) px-4 py-3.5 text-sm font-semibold text-(--success)">
                        <Check size={17} />
                        Day {selectedReadingPlanDayData.day_number} completed
                      </div>
                    ) : (
                      <div className="mt-7 rounded-xl bg-(--surface-strong) px-4 py-3.5 text-center text-sm text-(--muted-strong)">
                        Complete Day {nextIncompleteReadingPlanDay} first to
                        continue.
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="mt-5 rounded-2xl bg-(--surface-strong) p-5">
                <p className="text-sm leading-6 text-(--muted-strong)">
                  Your Reading Plan is enrolled, but the plan content is not
                  currently available.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ------------------------------------------------------------
            QUICK ACTIONS
        ------------------------------------------------------------- */}
        <div data-onboarding="quick-actions" className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--muted)">
            Quick actions
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Link
              to="/bookmarks"
              className="group rounded-2xl border border-(--border) bg-(--surface) p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-(--primary)/30 hover:shadow-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--surface-strong) text-(--primary)">
                <Bookmark size={18} />
              </div>

              <p className="mt-3 text-sm font-semibold text-(--text)">
                Bookmarks
              </p>

              <p className="mt-1 text-xs leading-5 text-(--muted)">
                View your saved verses
              </p>
            </Link>

            <Link
              to="/notes"
              className="group rounded-2xl border border-(--border) bg-(--surface) p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-(--primary)/30 hover:shadow-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--surface-strong) text-(--primary)">
                <FileText size={18} />
              </div>

              <p className="mt-3 text-sm font-semibold text-(--text)">Notes</p>

              <p className="mt-1 text-xs leading-5 text-(--muted)">
                Write and revisit your thoughts
              </p>
            </Link>
          </div>
        </div>

        <AskAboutPassage
          englishChapters={englishChapters}
          responseLanguage={responseLanguage}
          isOpen={isAskOpen}
          onOpen={() => setIsAskOpen(true)}
          onClose={() => setIsAskOpen(false)}
        />

        {/* ------------------------------------------------------------
            REFLECTION
        ------------------------------------------------------------- */}
        <div
          data-onboarding="reflection"
          className="mt-6 rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--primary)">
            Reflect
          </p>

          <p className="mt-2 text-sm leading-6 text-(--muted-strong)">
            {todaysPrompt}
          </p>
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
