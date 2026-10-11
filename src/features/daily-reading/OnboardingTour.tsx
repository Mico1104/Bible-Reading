import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { onboardingSteps, type OnboardingStep } from "./onboardSteps";

type TargetRect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

type OnboardingTourProps = {
  userId: string;
  onClose: () => void;
};

const getTarget = (target: string) => {
  const element = document.querySelector<HTMLElement>(
    `[data-onboarding="${target}"]`,
  );
  if (!element || element.getClientRects().length === 0) return null;

  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 ? element : null;
};

const getRect = (element: HTMLElement): TargetRect => {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  };
};

export const OnboardingTour = ({ userId, onClose }: OnboardingTourProps) => {
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();
  const steps: OnboardingStep[] = onboardingSteps;
  const [stepIndex, setStepIndex] = useState(0);
  const [targetPosition, setTargetPosition] = useState<{
    target: string;
    rect: TargetRect;
  } | null>(null);
  const [unavailableTarget, setUnavailableTarget] = useState<string | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const step = steps[stepIndex];

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const finish = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ guided_tour_completed: true })
        .eq("id", userId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      onCloseRef.current();
    } catch (error) {
      console.error("Unable to save guided-tour completion.", error);
      setSaveError("We couldn't save your choice. Please try again.");
      setIsSaving(false);
    }
  }, [isSaving, queryClient, userId]);

  const goNext = useCallback(() => {
    if (stepIndex === steps.length - 1) {
      void finish();
      return;
    }
    setStepIndex((currentIndex) => currentIndex + 1);
  }, [finish, stepIndex, steps.length]);

  const goBack = useCallback(() => {
    setStepIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  }, []);

  useEffect(() => {
    if (!step) return;

    let timeout: number | undefined;
    let target = getTarget(step.target);
    let hasScrolledToTarget = false;

    const updateRect = () => {
      target = getTarget(step.target);
      if (target) {
        setTargetPosition({ target: step.target, rect: getRect(target) });
        setUnavailableTarget(null);
      } else {
        setUnavailableTarget(step.target);
      }
    };

    const revealTarget = () => {
      target = getTarget(step.target);
      if (!target) {
        updateRect();
        return;
      }

      if (!hasScrolledToTarget) {
        hasScrolledToTarget = true;
        target.scrollIntoView({
          behavior: reduceMotion ? "instant" : "smooth",
          block: "center",
          inline: "nearest",
        });
      }
      updateRect();
    };

    const observer = new MutationObserver(revealTarget);
    observer.observe(document.body, { childList: true, subtree: true });

    if (target) {
      hasScrolledToTarget = true;
      target.scrollIntoView({
        behavior: reduceMotion ? "instant" : "smooth",
        block: "center",
        inline: "nearest",
      });
    } else {
      timeout = window.setTimeout(() => {
        observer.disconnect();
        if (!getTarget(step.target)) setUnavailableTarget(step.target);
      }, 1000);
    }

    const frame = window.requestAnimationFrame(updateRect);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      observer.disconnect();
      if (timeout) window.clearTimeout(timeout);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [reduceMotion, step]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        void finish();
        return;
      }

      if (event.key === "ArrowRight" && !isSaving) {
        event.preventDefault();
        goNext();
        return;
      }

      if (event.key === "ArrowLeft" && !isSaving) {
        event.preventDefault();
        goBack();
        return;
      }

      if (event.key === "Tab" && cardRef.current) {
        const focusable = cardRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled])",
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!cardRef.current.contains(document.activeElement)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    cardRef.current?.querySelector<HTMLElement>("button:not([disabled])")?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [finish, goBack, goNext, isSaving]);

  if (!step) return null;

  const targetRect =
    targetPosition?.target === step.target ? targetPosition.rect : null;
  const isTargetUnavailable = unavailableTarget === step.target;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isSmallScreen = viewportWidth < 640;
  const cardWidth = Math.min(420, viewportWidth - 32);
  const cardHeight = 280;
  const cardLeft = isSmallScreen
    ? 16
    : Math.min(
        Math.max(
          16,
          (targetRect?.left ?? viewportWidth / 2) +
            (targetRect?.width ?? 0) / 2 -
            cardWidth / 2,
        ),
        viewportWidth - cardWidth - 16,
      );
  const maxCardTop = Math.max(16, viewportHeight - cardHeight - 16);
  const fitsBelow =
    targetRect && targetRect.bottom + cardHeight + 16 <= viewportHeight;
  const cardTop = isSmallScreen
    ? undefined
    : targetRect
      ? Math.min(
          maxCardTop,
          Math.max(
            16,
            fitsBelow
              ? targetRect.bottom + 16
              : targetRect.top - cardHeight - 16,
          ),
        )
      : Math.min(maxCardTop, Math.max(16, (viewportHeight - cardHeight) / 2));

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        aria-hidden="true"
      >
        {!targetRect || isTargetUnavailable ? (
          <div className="absolute inset-0 bg-(--overlay)" />
        ) : (
          <>
            <div
              className="absolute inset-x-0 top-0 bg-(--overlay)"
              style={{ height: Math.max(0, targetRect.top) }}
            />
            <div
              className="absolute inset-x-0 bottom-0 bg-(--overlay)"
              style={{ top: Math.min(viewportHeight, targetRect.bottom) }}
            />
            <div
              className="absolute bg-(--overlay)"
              style={{
                top: Math.max(0, targetRect.top),
                left: 0,
                width: Math.max(0, targetRect.left),
                height: Math.max(
                  0,
                  Math.min(viewportHeight, targetRect.bottom) -
                    Math.max(0, targetRect.top),
                ),
              }}
            />
            <div
              className="absolute bg-(--overlay)"
              style={{
                top: Math.max(0, targetRect.top),
                left: Math.min(viewportWidth, targetRect.right),
                right: 0,
                height: Math.max(
                  0,
                  Math.min(viewportHeight, targetRect.bottom) -
                    Math.max(0, targetRect.top),
                ),
              }}
            />
            <motion.div
              className="pointer-events-none absolute rounded-xl border-2 border-(--primary) shadow-[0_0_0_4px_var(--shadow)]"
              animate={{
                top: targetRect.top - 4,
                left: targetRect.left - 4,
                width: targetRect.width + 8,
                height: targetRect.height + 8,
              }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
            />
          </>
        )}
      </motion.div>

      <motion.div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description"
        className="fixed z-50 overflow-y-auto rounded-2xl border border-(--border) bg-(--surface) p-5 text-(--text) shadow-[0_18px_50px_var(--shadow)] sm:p-6"
        style={{
          top: cardTop,
          bottom: isSmallScreen
            ? "max(16px, env(safe-area-inset-bottom))"
            : undefined,
          left: cardLeft,
          width: cardWidth,
          maxHeight: isSmallScreen ? "65vh" : "calc(100vh - 32px)",
        }}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--primary)">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <span
            role="progressbar"
            aria-label="Tour progress"
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-valuenow={stepIndex + 1}
            className="h-1.5 w-20 overflow-hidden rounded-full bg-(--surface-muted)"
          >
            <span
              className="block h-full rounded-full bg-(--primary) transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </span>
        </div>
        <h2
          id="onboarding-title"
          className="font-display mt-3 text-xl sm:text-2xl"
        >
          {step.title}
        </h2>
        <p
          id="onboarding-description"
          className="mt-2 text-sm leading-6 text-(--muted-strong)"
        >
          {step.description}
        </p>
        {isTargetUnavailable && (
          <p className="mt-3 text-sm text-(--muted-strong)">
            This section isn't available right now. You can continue the tour.
          </p>
        )}
        {saveError && (
          <p role="alert" className="mt-3 text-sm text-(--danger)">
            {saveError}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => void finish()}
            disabled={isSaving}
            className="rounded-lg px-2 py-2 text-sm font-semibold text-(--muted-strong) underline-offset-4 hover:text-(--text) hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) disabled:opacity-50"
          >
            Skip tour
          </button>
          <div className="ml-auto flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={goBack}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-(--border) px-3 py-2 text-sm font-semibold text-(--muted-strong) transition hover:bg-(--surface-muted)  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) disabled:opacity-50"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-(--primary) px-4 py-2 text-sm font-semibold text-(--on-primary) transition hover:bg-(--primary-strong)  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) disabled:opacity-50"
            >
              {isSaving
                ? "Saving..."
                : stepIndex === steps.length - 1
                  ? "Start Reading"
                  : "Next"}
              {stepIndex < steps.length - 1 && (
                <ArrowRight size={16} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
