/**
 * Client-Side Rate Limiter Utility
 * Implements sliding-window and token bucket rate limiting for sensitive operations.
 */

interface RateLimitRecord {
  timestamps: number[];
}

class RateLimiter {
  private storageKey = "buildwave_rate_limits";

  private getRecords(): Record<string, RateLimitRecord> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveRecords(records: Record<string, RateLimitRecord>): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch (e) {
      console.warn("Failed to persist rate limit records to localStorage", e);
    }
  }

  /**
   * Checks if an action under a given key is allowed based on max attempts within windowMs.
   */
  public check(
    actionKey: string,
    maxAttempts: number = 5,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number; retryAfterSec: number } {
    const now = Date.now();
    const records = this.getRecords();
    const actionRecord = records[actionKey] || { timestamps: [] };

    // Filter out timestamps outside the sliding window
    const validTimestamps = actionRecord.timestamps.filter(
      (ts) => now - ts < windowMs
    );

    if (validTimestamps.length >= maxAttempts) {
      const oldestInWindow = Math.min(...validTimestamps);
      const retryAfterMs = windowMs - (now - oldestInWindow);
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);

      return {
        allowed: false,
        remaining: 0,
        retryAfterSec,
      };
    }

    return {
      allowed: true,
      remaining: maxAttempts - validTimestamps.length,
      retryAfterSec: 0,
    };
  }

  /**
   * Consumes one attempt for the given key. Returns updated limit status.
   */
  public consume(
    actionKey: string,
    maxAttempts: number = 5,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number; retryAfterSec: number } {
    const checkResult = this.check(actionKey, maxAttempts, windowMs);
    if (!checkResult.allowed) {
      return checkResult;
    }

    const now = Date.now();
    const records = this.getRecords();
    const actionRecord = records[actionKey] || { timestamps: [] };

    const validTimestamps = actionRecord.timestamps.filter(
      (ts) => now - ts < windowMs
    );

    validTimestamps.push(now);
    records[actionKey] = { timestamps: validTimestamps };

    this.saveRecords(records);

    return {
      allowed: true,
      remaining: maxAttempts - validTimestamps.length,
      retryAfterSec: 0,
    };
  }

  /**
   * Resets rate limit records for a specific key (e.g. upon successful login).
   */
  public reset(actionKey: string): void {
    const records = this.getRecords();
    delete records[actionKey];
    this.saveRecords(records);
  }
}

export const rateLimiter = new RateLimiter();
