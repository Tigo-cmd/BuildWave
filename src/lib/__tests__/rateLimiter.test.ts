import { describe, it as test, beforeEach } from "node:test";
import assert from "node:assert";
import { rateLimiter } from "../rateLimiter";

// Mock localStorage for node environment if missing
if (typeof localStorage === "undefined" || localStorage === null) {
  let store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

describe("RateLimiter Utility", () => {
  const testKey = "test_action_limit";

  beforeEach(() => {
    rateLimiter.reset(testKey);
  });

  test("allows initial requests up to maxAttempts", () => {
    const maxAttempts = 3;
    const windowMs = 60000;

    for (let i = 0; i < maxAttempts; i++) {
      const res = rateLimiter.consume(testKey, maxAttempts, windowMs);
      assert.strictEqual(res.allowed, true);
      assert.strictEqual(res.remaining, maxAttempts - (i + 1));
    }
  });

  test("blocks requests when maxAttempts is exceeded", () => {
    const maxAttempts = 2;
    const windowMs = 60000;

    rateLimiter.consume(testKey, maxAttempts, windowMs);
    rateLimiter.consume(testKey, maxAttempts, windowMs);

    const blockedRes = rateLimiter.consume(testKey, maxAttempts, windowMs);
    assert.strictEqual(blockedRes.allowed, false);
    assert.strictEqual(blockedRes.remaining, 0);
    assert.ok(blockedRes.retryAfterSec > 0);
  });

  test("resets rate limit record correctly", () => {
    const maxAttempts = 1;
    rateLimiter.consume(testKey, maxAttempts, 60000);
    assert.strictEqual(rateLimiter.check(testKey, maxAttempts, 60000).allowed, false);

    rateLimiter.reset(testKey);
    assert.strictEqual(rateLimiter.check(testKey, maxAttempts, 60000).allowed, true);
  });
});
