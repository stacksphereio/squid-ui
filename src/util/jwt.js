// src/util/jwt.js
export function readJwt() {
  try {
    const t = localStorage.getItem('squid.token');
    if (!t) return null;
    const [, payload] = t.split('.');
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return { token: t, payload: json };
  } catch {
    return null;
  }
}

export function tokenExpiryMs() {
  const j = readJwt();
  const exp = j?.payload?.exp;
  if (!exp) return null;
  return exp * 1000;
}

export function msUntilExpiry() {
  const ms = tokenExpiryMs();
  if (!ms) return null;
  return ms - Date.now();
}

export function isExpired() {
  const left = msUntilExpiry();
  return left !== null && left <= 0;
}