// src/util/debug.js

// Level ordering (higher index = more verbose we allow to pass)
const LEVELS = ['off','error','warn','info','debug'];
let currentLevel = 'info';   // default
let fmOverride  = null;      // if FM sets a level

// Allow local/manual override for dev:
export const DEBUG_SQUID = (() => {
  try {
    return localStorage.getItem('squid.debug') === 'true'
      || process.env.REACT_APP_SQUID_DEBUG === 'true';
  } catch {
    return process.env.REACT_APP_SQUID_DEBUG === 'true';
  }
})();

// Back-compat: if showDebugFooter toggles this, we still support it
export function setDebugFromFlags(on) {
  fmOverride = on ? 'debug' : null; // if true → force 'debug', else release to normal
  // Recompute effective level
  currentLevel = fmOverride || currentLevel || 'info';
}

export function setLogLevel(level) {
  if (LEVELS.includes(level)) {
    currentLevel = level;
  }
}

function allowed(min) {
  const eff = fmOverride || currentLevel || 'info';
  return LEVELS.indexOf(eff) >= LEVELS.indexOf(min);
}

export const log   = (...a) => { if (allowed('info'))  console.log('[squid-ui]', ...a); };
export const info  = (...a) => { if (allowed('info'))  console.info('[squid-ui]', ...a); };
export const warn  = (...a) => { if (allowed('warn'))  console.warn('[squid-ui]', ...a); };
export const error = (...a) => { if (allowed('error')) console.error('[squid-ui]', ...a); };
// “debug” is the noisiest
export const debug = (...a) => { if (allowed('debug') || DEBUG_SQUID) console.log('[squid-ui][debug]', ...a); };

// Back-compat alias (was boolean-gated)
export const dlog = debug;