import { describe, it as test } from "node:test";
import assert from "node:assert";
import {
  sanitizeInput,
  sanitizeObject,
  validateEmail,
  validatePassword,
} from "../security";

describe("Security Utility", () => {
  test("sanitizeInput escapes HTML tags to prevent XSS", () => {
    const dangerousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(dangerousInput);
    assert.strictEqual(sanitized, "&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;");
  });

  test("sanitizeObject recursively sanitizes string values", () => {
    const inputObj = {
      name: "<b>John</b>",
      nested: {
        bio: '<img src=x onerror="alert(1)" />',
      },
      num: 123,
    };

    const sanitized = sanitizeObject(inputObj);
    assert.strictEqual(sanitized.name, "&lt;b&gt;John&lt;&#x2F;b&gt;");
    assert.strictEqual(sanitized.nested.bio, "&lt;img src=x onerror=&quot;alert(1)&quot; &#x2F;&gt;");
    assert.strictEqual(sanitized.num, 123);
  });

  test("validateEmail accurately validates email addresses", () => {
    assert.strictEqual(validateEmail("user@example.com"), true);
    assert.strictEqual(validateEmail("student.123@university.edu.ng"), true);
    assert.strictEqual(validateEmail("invalid-email"), false);
    assert.strictEqual(validateEmail("user@.com"), false);
  });

  test("validatePassword enforces complexity rules", () => {
    const weakResult = validatePassword("12345");
    assert.strictEqual(weakResult.isValid, false);
    assert.ok(weakResult.feedback.length > 0);

    const strongResult = validatePassword("SecureP@ssword123");
    assert.strictEqual(strongResult.isValid, true);
    assert.strictEqual(strongResult.feedback.length, 0);
  });
});
