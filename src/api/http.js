// src/api/http.js
import { dlog } from '../util/debug';

export function getAuthToken() {
  try { return localStorage.getItem('squid.token') || ''; }
  catch { return ''; }
}

function buildHeaders(init = {}, auth = true) {
  const base = new Headers(init || {});
  if (!base.has('Accept')) base.set('Accept', 'application/json,text/plain,*/*');
  if (!base.has('Content-Type')) base.set('Content-Type', 'application/json');

  if (auth) {
    const token = getAuthToken();
    if (token) base.set('Authorization', `Bearer ${token}`);
  }
  return base;
}

// Minimal, predictable JSON fetch helper
export async function fetchJson(path, { method = 'GET', body, headers, auth = true } = {}) {
  const init = {
    method,
    headers: buildHeaders(headers, auth),
    credentials: 'include', // harmless if server ignores cookies
  };
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  dlog('HTTP', method, path, { auth, hasBody: body !== undefined });

  const res = await fetch(path, init);
  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';

  let data = text;
  if (contentType.includes('application/json')) {
    try { data = text ? JSON.parse(text) : null; } catch { /* keep as text */ }
  }

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}