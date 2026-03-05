// src/api/__tests__/http.test.js
import { getAuthToken, fetchJson } from '../http';

describe('http utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAuthToken', () => {
    it('returns empty string when no token', () => {
      expect(getAuthToken()).toBe('');
    });

    it('returns token from localStorage', () => {
      localStorage.setItem('squid.token', 'test-token-123');
      expect(getAuthToken()).toBe('test-token-123');
    });

    it('returns empty string on localStorage error', () => {
      const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(getAuthToken()).toBe('');
      spy.mockRestore();
    });

    it('returns "null" string when localStorage has null', () => {
      // Note: localStorage.setItem(key, null) stores the string "null"
      localStorage.setItem('squid.token', null);
      expect(getAuthToken()).toBe('null');
    });
  });

  describe('fetchJson', () => {
    it('performs GET request by default', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '{"result":"success"}',
      });

      const data = await fetchJson('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({ method: 'GET' })
      );
      expect(data).toEqual({ result: 'success' });
    });

    it('includes Authorization header when token exists', async () => {
      localStorage.setItem('squid.token', 'bearer-token-xyz');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '{}',
      });

      await fetchJson('/api/protected');

      const call = global.fetch.mock.calls[0][1];
      expect(call.headers.get('Authorization')).toBe('Bearer bearer-token-xyz');
    });

    it('excludes Authorization header when auth=false', async () => {
      localStorage.setItem('squid.token', 'token');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '{}',
      });

      await fetchJson('/api/public', { auth: false });

      const call = global.fetch.mock.calls[0][1];
      expect(call.headers.has('Authorization')).toBe(false);
    });

    it('sets default headers', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '{}',
      });

      await fetchJson('/api/test');

      const call = global.fetch.mock.calls[0][1];
      expect(call.headers.get('Accept')).toBe('application/json,text/plain,*/*');
      expect(call.headers.get('Content-Type')).toBe('application/json');
    });

    it('allows custom headers to override defaults', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '{}',
      });

      await fetchJson('/api/test', {
        headers: { 'Content-Type': 'text/plain' },
      });

      const call = global.fetch.mock.calls[0][1];
      expect(call.headers.get('Content-Type')).toBe('text/plain');
    });

    it('includes credentials', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '{}',
      });

      await fetchJson('/api/test');

      const call = global.fetch.mock.calls[0][1];
      expect(call.credentials).toBe('include');
    });

    it('sends POST request with JSON body', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '{"created": true}',
      });

      const body = { name: 'test', value: 123 };
      const data = await fetchJson('/api/create', { method: 'POST', body });

      const call = global.fetch.mock.calls[0][1];
      expect(call.method).toBe('POST');
      expect(call.body).toBe(JSON.stringify(body));
      expect(data).toEqual({ created: true });
    });

    it('sends string body as-is', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '{}',
      });

      const body = 'raw string data';
      await fetchJson('/api/raw', { method: 'POST', body });

      const call = global.fetch.mock.calls[0][1];
      expect(call.body).toBe(body);
    });

    it('parses JSON response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '{"foo": "bar", "count": 42}',
      });

      const data = await fetchJson('/api/data');
      expect(data).toEqual({ foo: 'bar', count: 42 });
    });

    it('returns text when content-type is not JSON', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => 'plain text response',
      });

      const data = await fetchJson('/api/text');
      expect(data).toBe('plain text response');
    });

    it('throws error for non-ok response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '{"error": "not found"}',
      });

      await expect(fetchJson('/api/missing')).rejects.toThrow('HTTP 404 Not Found');
    });

    it('includes error body in thrown error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '{"error": "invalid input"}',
      });

      try {
        await fetchJson('/api/bad');
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.body).toEqual({ error: 'invalid input' });
      }
    });

    it('handles empty response body', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '',
      });

      const data = await fetchJson('/api/empty');
      expect(data).toBeNull();
    });

    it('handles malformed JSON response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => 'not valid json{',
      });

      const data = await fetchJson('/api/broken');
      // Falls back to returning text when JSON parse fails
      expect(data).toBe('not valid json{');
    });

    it('supports PUT requests', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '{"updated": true}',
      });

      await fetchJson('/api/update', { method: 'PUT', body: { id: 1 } });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/update',
        expect.objectContaining({ method: 'PUT' })
      );
    });

    it('supports DELETE requests', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '{"deleted": true}',
      });

      await fetchJson('/api/delete/123', { method: 'DELETE' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/delete/123',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
