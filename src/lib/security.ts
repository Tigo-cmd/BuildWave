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
  score: number; // 0 to 4
  feedback: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const feedback: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    feedback.push("Password must be at least 8 characters long.");
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push("Password must include at least one uppercase letter.");
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push("Password must include at least one lowercase letter.");
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push("Password must include at least one number.");
  } else {
    score += 1;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push("Password should ideally include a special character (!@#$%^&*).");
  }

  return {
    isValid: feedback.length === 0 || score >= 3,
    score,
    feedback,
  };
};

const CSRF_KEY = "buildwave_csrf_token";

export const generateCSRFToken = (): string => {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  try {
    sessionStorage.setItem(CSRF_KEY, token);
  } catch {
    // Session storage fallback
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
