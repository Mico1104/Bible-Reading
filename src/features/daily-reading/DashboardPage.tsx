import { useProfile } from "../auth/useProfile";
import { useTodayReading } from "./useTodaysReading";
import { useMarkComplete } from "./useMarkComplete";
import { Modal } from "@/components/Modal";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useVerses } from "./useVerse";
import { useBookmarks } from "@/hooks/useBookmarks";
import { BookOpen, Check, ChevronDown, ChevronUp } from "lucide-react";
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

export const DashboardPage = () => {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const userId = useAuthStore((state) => state.user?.id);
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

  const { data, isLoading, error } = useTodayReading();
  const markComplete = useMarkComplete();
  const [showFullPassage, setShowFullPassage] = useState(false);
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
            onClick={() => setShowFullPassage((prev) => !prev)}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-strong) px-3 py-2 text-sm font-semibold text-(--primary)"
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
                translation={translation}
                isBookmarked={isBookmarked}
                toggleBookmark={toggleBookmark}
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
                ? `${completePasses} Bible pass${completePasses > 1 ? "es" : ""} completed`
                : "Your first Bible pass"}
            </p>

            <p className="text-xs font-medium text-(--muted-strong)">
              Keep going!
            </p>
          </div>
        </div>

        <AskAboutPassage
          englishChapters={englishChapters}
          responseLanguage={responseLanguage}
          isOpen={isAskOpen}
          onOpen={() => setIsAskOpen(true)}
          onClose={() => setIsAskOpen(false)}
        />

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
