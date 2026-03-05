// src/__tests__/server.js
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Match any host and any path ending in /login.
// Adjust as needed; '**/auth/login' also works if your app uses that.
const handlers = [
  rest.post('**/login', async (req, res, ctx) => {
    const body = await req.json().catch(() => ({}));
    const { username, password } = body || {};
    if (username === 'demo' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'test-jwt',
          user: {
            id: 'u1',
            username: 'demo',
            full_name: 'Demo User',
            roles: ['user'],
          },
        })
      );
    }
    return res(ctx.status(401), ctx.json({ error: 'invalid credentials' }));
  }),

  // Health endpoints some components hit during boot
  rest.get('**/health', (_req, res, ctx) => res(ctx.status(200), ctx.text('ok'))),
  rest.get('**/ready', (_req, res, ctx) => res(ctx.status(200), ctx.text('ready'))),
];

export const server = setupServer(...handlers);