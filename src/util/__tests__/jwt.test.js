// src/util/__tests__/jwt.test.js
import { readJwt, tokenExpiryMs, msUntilExpiry, isExpired } from '../jwt';

describe('jwt utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('readJwt', () => {
    it('returns null when no token in localStorage', () => {
      expect(readJwt()).toBeNull();
    });

    it('returns null for invalid token format', () => {
      localStorage.setItem('squid.token', 'not-a-valid-token');
      expect(readJwt()).toBeNull();
    });

    it('returns null for token without payload', () => {
      localStorage.setItem('squid.token', 'header.');
      expect(readJwt()).toBeNull();
    });

    it('parses valid JWT token', () => {
      // Valid JWT with payload {"sub": "user123", "exp": 1234567890}
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxMjM0NTY3ODkwfQ.xyz';
      localStorage.setItem('squid.token', validToken);

      const result = readJwt();
      expect(result).not.toBeNull();
      expect(result.token).toBe(validToken);
      expect(result.payload).toEqual({ sub: 'user123', exp: 1234567890 });
    });

    it('handles URL-safe base64 encoding', () => {
      // Token with - and _ characters in payload
      const payload = { test: 'value' };
      const base64Payload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_');
      const token = `header.${base64Payload}.signature`;
      localStorage.setItem('squid.token', token);

      const result = readJwt();
      expect(result).not.toBeNull();
      expect(result.payload.test).toBe('value');
    });

    it('returns null for malformed JSON in payload', () => {
      const token = 'header.' + btoa('not-valid-json') + '.signature';
      localStorage.setItem('squid.token', token);

      expect(readJwt()).toBeNull();
    });

    it('handles localStorage errors gracefully', () => {
      const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(readJwt()).toBeNull();
      spy.mockRestore();
    });
  });

  describe('tokenExpiryMs', () => {
    it('returns null when no token', () => {
      expect(tokenExpiryMs()).toBeNull();
    });

    it('returns null when token has no exp claim', () => {
      const payload = { sub: 'user123' };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.setItem('squid.token', token);

      expect(tokenExpiryMs()).toBeNull();
    });

    it('returns expiry time in milliseconds', () => {
      const exp = 1234567890; // seconds since epoch
      const payload = { sub: 'user123', exp };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.setItem('squid.token', token);

      expect(tokenExpiryMs()).toBe(exp * 1000);
    });

    it('handles exp as number', () => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.setItem('squid.token', token);

      expect(tokenExpiryMs()).toBe(exp * 1000);
    });
  });

  describe('msUntilExpiry', () => {
    it('returns null when no token', () => {
      expect(msUntilExpiry()).toBeNull();
    });

    it('returns null when token has no exp', () => {
      const payload = { sub: 'user123' };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.setItem('squid.token', token);

      expect(msUntilExpiry()).toBeNull();
    });

    it('returns positive milliseconds for future expiry', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: futureExp };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.setItem('squid.token', token);

      const ms = msUntilExpiry();
      expect(ms).toBeGreaterThan(0);
      expect(ms).toBeLessThanOrEqual(3600 * 1000);
    });

    it('returns negative milliseconds for past expiry', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = { exp: pastExp };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.setItem('squid.token', token);

      const ms = msUntilExpiry();
      expect(ms).toBeLessThan(0);
    });
  });

  describe('isExpired', () => {
    it('returns false when no token', () => {
      // When there's no token, msUntilExpiry returns null
      expect(isExpired()).toBe(false);
    });

    it('returns false for future expiry', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp: futureExp };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.setItem('squid.token', token);

      expect(isExpired()).toBe(false);
    });

    it('returns true for past expiry', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 10;
      const payload = { exp: pastExp };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.setItem('squid.token', token);

      expect(isExpired()).toBe(true);
    });

    it('returns true for exactly expired token (0 ms left)', () => {
      const nowExp = Math.floor(Date.now() / 1000);
      const payload = { exp: nowExp };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.setItem('squid.token', token);

      expect(isExpired()).toBe(true);
    });

    it('handles token without exp as not expired', () => {
      const payload = { sub: 'user' };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      localStorage.setItem('squid.token', token);

      expect(isExpired()).toBe(false);
    });
  });
});
