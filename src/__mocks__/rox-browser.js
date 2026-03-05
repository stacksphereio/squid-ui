// src/__mocks__/rox-browser.js
// Manual Jest mock for "rox-browser" used in tests only.

const subscribers = new Set();

class Flag {
  constructor(defaultValue = false) { this._v = !!defaultValue; }
  isEnabled() { return !!this._v; }
  __set(v) { this._v = !!v; }       // test helper
}

class RoxString {
  constructor(defaultValue = "", _opts) { this._v = String(defaultValue); }
  getValue() { return this._v; }
  __set(v) { this._v = String(v); } // test helper
}

class RoxNumber {
  constructor(defaultValue = 0, _opts) { this._v = Number(defaultValue); }
  getValue() { return this._v; }
  __set(v) { this._v = Number(v); } // test helper
}

const Rox = {
  Flag,
  RoxString,
  RoxNumber,

  register: jest.fn(),                           // Rox.register(ns, flags)
  setup: jest.fn().mockResolvedValue(undefined), // await Rox.setup(...)
  fetch: jest.fn().mockResolvedValue(undefined),

  on: jest.fn((_eventName, cb) => {
    // Very simple event hub for tests
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  }),

  // Allow tests to simulate a configuration change push:
  __emit(payload = { reason: 'TEST' }) {
    for (const cb of subscribers) cb(payload);
  },
};

// Support both `import Rox from 'rox-browser'` and `require('rox-browser')`
module.exports = Rox;
module.exports.default = Rox;