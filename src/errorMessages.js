// src/components/Login/errorMessages.js

export const ERROR_MAP = {
  // server-provided strings/codes -> friendly messages
  "invalid credentials": "That username or password is incorrect.",
  INVALID_CREDENTIALS: "That username or password is incorrect.",

  ACCOUNT_LOCKED: "Your account is locked. Please contact support.",
  MFA_REQUIRED: "Multi-factor authentication is required. Please complete MFA.",
  RATE_LIMITED: "Too many attempts. Please try again in a minute.",
};

/**
 * Normalize an auth error into a user-friendly message.
 * Accepts objects like: { status, code, raw, message }
 */
export function toFriendlyError(input = {}) {
  const { status, code, raw, message } = input || {};

  // 1) Known explicit code/text
  if (code && ERROR_MAP[code]) return ERROR_MAP[code];
  if (raw && ERROR_MAP[raw]) return ERROR_MAP[raw];
  if (message && ERROR_MAP[message]) return ERROR_MAP[message];

  // 2) Status-based fallbacks
  if (status === 401) return "That username or password is incorrect.";
  if (status === 403) return "You don’t have access to this resource.";
  if (status === 429) return "Too many attempts. Please wait and try again.";
  if (typeof status === "number" && status >= 500) {
    return "Our server is having a moment. Please try again shortly.";
  }

  // 3) Final catch-all
  return "We couldn’t sign you in. Please try again.";
}

// Back-compat alias so callers can import { errorMessages } ...
export const errorMessages = toFriendlyError;

// ...and also allow default import: import errorMessages from './errorMessages'
export default toFriendlyError;