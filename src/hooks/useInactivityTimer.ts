import { useEffect, useRef, useCallback } from "react";

interface UseInactivityTimerOptions {
  timeoutMs?: number; // Default: 30 mins (1800000 ms)
  onTimeout: () => void;
  enabled?: boolean;
}

export const useInactivityTimer = ({
  timeoutMs = 1800000,
  onTimeout,
  enabled = true,
}: UseInactivityTimerOptions) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (enabled) {
      timerRef.current = setTimeout(() => {
        onTimeout();
      }, timeoutMs);
    }
  }, [timeoutMs, onTimeout, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];

    const handleUserActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Initialize timer
    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [enabled, resetTimer]);
};
