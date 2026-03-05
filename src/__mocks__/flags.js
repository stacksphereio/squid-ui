// src/__mocks__/flags.js
// Deterministic in-memory mock for feature flags in tests.

let _state = {
  showTopBannerEnhanced: false,
  showDebugFooter: false,
  adminHealth: false,
};

const _subs = new Set();

export function getFlagsSnapshot() {
  // Shape matches the real implementation’s snapshot
  return { ..._state };
}

export function subscribeFlags(cb) {
  if (typeof cb === "function") {
    _subs.add(cb);
    // Fire immediately so components render with current values
    cb("mock-init", { ..._state });
    return () => _subs.delete(cb);
  }
  return () => {};
}

// Test helper to push new values and notify subscribers
export function __pushFlags(patch) {
  _state = { ..._state, ...patch };
  for (const cb of _subs) cb("mock-push", { ..._state });
}

// Keep named/default exports present so imports don’t break
export const flags = {};
export default {};