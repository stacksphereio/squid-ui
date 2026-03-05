// src/setupTests.js
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Always run the Node MSW server in Jest (jsdom).
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// (Optional) fetch fallback if the environment lacks fetch.
// Node 20 has global fetch, so this usually never runs.
if (typeof globalThis.fetch !== 'function') {
  globalThis.fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
}