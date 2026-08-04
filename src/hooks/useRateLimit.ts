import { useState, useEffect, useCallback } from "react";
import { rateLimiter } from "@/lib/rateLimiter";

interface UseRateLimitOptions {
  actionKey: string;
  maxAttempts?: number;
  windowMs?: number;
}

export const useRateLimit = ({
  actionKey,
  maxAttempts = 5,
  windowMs = 60000,
}: UseRateLimitOptions) => {
  const [allowed, setAllowed] = useState(true);
  const [remaining, setRemaining] = useState(maxAttempts);
  const [retryAfterSec, setRetryAfterSec] = useState(0);

  const updateStatus = useCallback(() => {
    const status = rateLimiter.check(actionKey, maxAttempts, windowMs);
    setAllowed(status.allowed);
    setRemaining(status.remaining);
    setRetryAfterSec(status.retryAfterSec);
    return status;
  }, [actionKey, maxAttempts, windowMs]);

  useEffect(() => {
    updateStatus();
  }, [updateStatus]);

  // Countdown timer for retryAfterSec
  useEffect(() => {
    if (retryAfterSec <= 0) return;

    const timer = setInterval(() => {
      setRetryAfterSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          updateStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfterSec, updateStatus]);

  const attemptAction = useCallback((): {
    allowed: boolean;
    remaining: number;
    retryAfterSec: number;
  } => {
    const result = rateLimiter.consume(actionKey, maxAttempts, windowMs);
    setAllowed(result.allowed);
    setRemaining(result.remaining);
    setRetryAfterSec(result.retryAfterSec);
    return result;
  }, [actionKey, maxAttempts, windowMs]);

  const resetLimit = useCallback(() => {
    rateLimiter.reset(actionKey);
    updateStatus();
  }, [actionKey, updateStatus]);

  return {
    allowed,
    remaining,
    retryAfterSec,
    attemptAction,
    resetLimit,
    checkLimit: updateStatus,
  };
};
