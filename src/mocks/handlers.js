// src/mocks/handlers.js
import { rest } from 'msw';

// Common success payload that matches what src/api/auth.js can parse.
function successLoginPayload() {
  return {
    token: 'mock-jwt-token',
    user_id: 'u-demo-1',
    username: 'demo',
    roles: ['admin'],
    full_name: 'Demo Admin',
    email: 'demo@example.com',
    country: 'GB',
    address: '1 Demo Street',
    phone_number: '+441234567890',
  };
}

// Build both relative and (optional) absolute URL handlers so tests stay resilient
const loginPaths = [
  '/api/kraken-auth/login',
  'http://localhost:8080/api/kraken-auth/login',
];

export const handlers = [
  // --- login ---
  ...loginPaths.map((p) =>
    rest.post(p, async (req, res, ctx) => {
      let creds = {};
      try {
        creds = await req.json();
      } catch (e) {
        /* ignore non-JSON */
      }

      const { username, password } = creds || {};
      const okUser =
        (username === 'demo' || username === 'admin') && password === 'password';

      if (okUser) {
        return res(ctx.status(200), ctx.json(successLoginPayload()));
      }
      return res(ctx.status(401), ctx.json({ message: 'invalid credentials' }));
    }),
  ),

  // --- minimal admin stubs used by screens ---
  rest.get('/api/kraken-auth/admin/users', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json([]));
  }),

  rest.get('/api/kraken-auth/admin/roles', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json([{ id: 1, name: 'admin' }]));
  }),
];