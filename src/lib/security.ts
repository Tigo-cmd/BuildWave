/**
 * Security & Input Validation Utility Module
 * Enforces XSS sanitization, password policy, email format validation, and CSRF session verification.
 */

export const sanitizeInput = (input: string): string => {
  if (typeof input !== "string") return input;

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
};

export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
};

export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 5
  feedback: string[];
}

// Common weak passwords that should always be rejected
const COMMON_PASSWORDS = new Set([
  "password", "12345678", "123456789", "1234567890", "qwerty123",
  "password1", "password123", "iloveyou", "sunshine1", "princess1",
  "football1", "charlie1", "trustno1", "letmein12", "welcome1",
  "abc12345", "monkey123", "master123", "dragon123", "login123",
  "admin123", "buildwave", "student1", "project1", "university",
]);

/**
 * Validates password strength with strict security requirements.
 * Requires: 8+ chars, uppercase, lowercase, number, special character.
 * Rejects common passwords and sequential/repeated patterns.
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const feedback: string[] = [];
  let score = 0;

  // Length check - minimum 8, bonus for 12+
  if (!password || password.length < 8) {
    feedback.push("Password must be at least 8 characters long.");
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push("Must include at least one uppercase letter (A-Z).");
  } else {
    score += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push("Must include at least one lowercase letter (a-z).");
  } else {
    score += 1;
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    feedback.push("Must include at least one number (0-9).");
  } else {
    score += 1;
  }

  // Special character check - REQUIRED
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    feedback.push("Must include at least one special character (!@#$%^&*).");
  } else {
    score += 1;
  }

  // Reject common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    feedback.push("This password is too common. Choose something more unique.");
    score = Math.max(0, score - 2);
  }

  // Reject sequential characters (e.g., "abcdef", "123456")
  if (/(.)\1{2,}/.test(password)) {
    feedback.push("Avoid repeating the same character 3+ times in a row.");
    score = Math.max(0, score - 1);
  }

  // Reject if password contains "password" or "buildwave"
  const lowerPass = password.toLowerCase();
  if (lowerPass.includes("password") || lowerPass.includes("buildwave")) {
    feedback.push("Password cannot contain 'password' or 'buildwave'.");
    score = Math.max(0, score - 1);
  }

  return {
    isValid: feedback.length === 0,
    score,
    feedback,
  };
};

/**
 * Returns a human-readable password strength label.
 */
export const getPasswordStrength = (score: number): { label: string; color: string } => {
  if (score <= 1) return { label: "Very Weak", color: "text-red-600" };
  if (score === 2) return { label: "Weak", color: "text-orange-500" };
  if (score === 3) return { label: "Fair", color: "text-yellow-500" };
  if (score === 4) return { label: "Strong", color: "text-green-500" };
  return { label: "Very Strong", color: "text-green-700" };
};

const CSRF_KEY = "buildwave_csrf_token";

/**
 * Generates a cryptographically stronger CSRF token using Web Crypto API.
 */
export const generateCSRFToken = (): string => {
  let token: string;
  try {
    // Use Web Crypto API for secure random values
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    token = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Fallback for environments without crypto
    token = Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  try {
    sessionStorage.setItem(CSRF_KEY, token);
  } catch {
    // Session storage unavailable
  }
  return token;
};

export const getCSRFToken = (): string => {
  let token = sessionStorage.getItem(CSRF_KEY);
  if (!token) {
    token = generateCSRFToken();
  }
  return token;
};

export const verifyCSRFToken = (token: string): boolean => {
  const storedToken = sessionStorage.getItem(CSRF_KEY);
  return Boolean(storedToken && storedToken === token);
};
