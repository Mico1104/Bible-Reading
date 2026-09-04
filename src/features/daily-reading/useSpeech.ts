import { useCallback, useEffect, useRef, useState } from "react";

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false)
  const [voicesReady, setVoicesReady] = useState(false);

  useEffect(() => {
    const checkVoices = () => {
      if(window.speechSynthesis.getVoices().length > 0){
        setVoicesReady(true);
      }
    };
    checkVoices();
    window.speechSynthesis.onvoiceschanged = checkVoices
  }, [])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    setIsPreparing(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsPreparing(false)
      setIsSpeaking(true);
      setIsPaused(false);
      
    };

    utterance.onend = () => {
      setIsPreparing(false)
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPreparing(false)
      setIsSpeaking(false);
      setIsPaused(false);
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
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  return { isSpeaking, isPaused, speak, pause, resume, stop, isPreparing, voicesReady };
  
};
