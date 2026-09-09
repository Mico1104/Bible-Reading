import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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

const getTarget = (target: string) =>
  document.querySelector<HTMLElement>(`[data-onboarding="${target}"]`);

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
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const step = steps[stepIndex];

  useEffect(() => {
    if (!step) {
      onClose();
      return;
    }

    const initialTarget = getTarget(step.target);
    let target = initialTarget;
    let timeout: number | undefined;
    const observer = new MutationObserver(() => {
      target = getTarget(step.target);
      if (target) {
        setTargetRect(getRect(target));
        observer.disconnect();
        if (timeout) window.clearTimeout(timeout);
      }
    });

    if (!target) {
      observer.observe(document.body, { childList: true, subtree: true });
      timeout = window.setTimeout(() => {
        if (getTarget(step.target)) return;
        observer.disconnect();
        setStepIndex((currentIndex) =>
          Math.min(currentIndex + 1, steps.length),
        );
      }, 1000);

      return () => {
        observer.disconnect();
        if (timeout) window.clearTimeout(timeout);
      };
    }

    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
      inline: "nearest",
    });

    const updateRect = () => {
      const currentTarget = getTarget(step.target);
      if (currentTarget) setTargetRect(getRect(currentTarget));
    };
    const frame = window.requestAnimationFrame(updateRect);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [onClose, reduceMotion, step, stepIndex, steps.length]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab" && cardRef.current) {
        const focusable = cardRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled])",
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    cardRef.current?.querySelector<HTMLElement>("button")?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const finish = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setSaveError(false);
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);

    if (error) {
      setSaveError(true);
      setIsSaving(false);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    onClose();
  };

  const goNext = () => {
    if (stepIndex === steps.length - 1) {
      void finish();
      return;
    }
    setStepIndex((currentIndex) => currentIndex + 1);
  };

  const goBack = () => {
    setStepIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  };

  if (!step || !targetRect) return null;

  const viewportHeight = window.innerHeight;
  const cardWidth = Math.min(360, window.innerWidth - 32);
  const fitsBelow = targetRect.bottom + 180 <= viewportHeight;
  const cardTop = fitsBelow
    ? targetRect.bottom + 16
    : Math.max(16, targetRect.top - 180);
  const cardLeft = Math.min(
    Math.max(16, targetRect.left + targetRect.width / 2 - cardWidth / 2),
    window.innerWidth - cardWidth - 16,
  );
  const clipPath = `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${targetRect.bottom}px, ${targetRect.left}px ${targetRect.bottom}px, ${targetRect.left}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.bottom}px, 0 ${targetRect.bottom}px)`;

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
        <div className="absolute inset-0 bg-(--overlay)" style={{ clipPath }} />
        <div
          className="absolute rounded-xl border-2 border-(--primary) shadow-[0_0_0_4px_var(--shadow)]"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
        <div
          className="absolute"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            pointerEvents: "auto",
          }}
        />
      </motion.div>

      <motion.div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="fixed z-50 rounded-xl border border-(--border) bg-(--surface) p-5 text-(--text) shadow-[0_18px_50px_var(--shadow)] sm:p-6"
        style={{ top: cardTop, left: cardLeft, width: cardWidth }}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--primary)">
          {stepIndex + 1} of {steps.length}
        </p>
        <h2 id="onboarding-title" className="font-display mt-2 text-xl">
          {step.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-(--muted-strong)">
          {step.description}
        </p>
        {saveError && (
          <p role="alert" className="mt-3 text-sm text-(--danger)">
            We couldn't save your choice. Please try again.
          </p>
        )}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => void finish()}
            disabled={isSaving}
            className="text-sm font-semibold text-(--muted-strong) underline-offset-4 hover:text-(--text) hover:underline disabled:opacity-50"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={goBack}
                disabled={isSaving}
                className="rounded-lg border border-(--border) px-3 py-2 text-sm font-semibold text-(--muted-strong) hover:bg-(--surface-muted) disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              disabled={isSaving}
              className="rounded-lg bg-(--primary) px-4 py-2 text-sm font-semibold text-white hover:bg-(--primary-strong) disabled:opacity-50"
            >
              {isSaving
                ? "Saving..."
                : stepIndex === steps.length - 1
                  ? "Start Reading"
                  : "Next"}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
