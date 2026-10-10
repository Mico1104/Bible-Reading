
import { useCallback, useRef, useState } from "react";

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  //const [voicesReady, setVoicesReady] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  
const voicesReady =
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  typeof SpeechSynthesisUtterance !== "undefined";


  const speak = useCallback((text: string) => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      typeof SpeechSynthesisUtterance === "undefined" ||
      !text.trim()
    ) {
      setIsPreparing(false);
      return;
    }

    // Prevent an earlier utterance's events from interfering
    // with the new utterance.
    const previousUtterance = utteranceRef.current;

    if (previousUtterance) {
      previousUtterance.onstart = null;
      previousUtterance.onend = null;
      previousUtterance.onerror = null;
    }

    window.speechSynthesis.cancel();

    setIsPreparing(true);
    setIsSpeaking(false);
    setIsPaused(false);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsPreparing(false);
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPreparing(false);
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      setIsPreparing(false);
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    const currentUtterance = utteranceRef.current;

    if (currentUtterance) {
      currentUtterance.onstart = null;
      currentUtterance.onend = null;
      currentUtterance.onerror = null;
    }

    window.speechSynthesis.cancel();
    utteranceRef.current = null;

    setIsPreparing(false);
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  return {
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    stop,
    isPreparing,
    voicesReady,
  };
};
