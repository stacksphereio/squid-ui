// src/api/auth.js
export async function login(username, password) {
  let res;
  try {
    res = await fetch('/api/kraken-auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json,text/plain,*/*',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include' // harmless if server ignores; OK for future cookies
    });
  } catch (fetchErr) {
    // Network error - can't reach nginx/service at all
    throw new Error('Unable to connect to authentication service. Please check your connection and try again.');
  }

  const raw = await res.text();
  if (!res.ok) {
    // Determine error type based on status code
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      // Bad Gateway / Service Unavailable / Gateway Timeout
      throw new Error('Authentication service is temporarily unavailable. Please try again later.');
    } else if (res.status === 401 || res.status === 403) {
      // Unauthorized / Forbidden - invalid credentials
      throw new Error('Invalid username or password. Please try again.');
    } else if (res.status === 400) {
      // Bad Request - check if server sent a message
      try {
        const parsed = JSON.parse(raw);
        throw new Error(parsed.error || parsed.message || 'Invalid request. Please check your credentials.');
      } catch {
        throw new Error('Invalid request. Please check your credentials.');
      }
    } else {
      // Other errors - generic message
      throw new Error(`Login failed. Please try again or contact support if the problem persists.`);
    }
  }

  // Backward + forward compatible parsing:
  // - if server still returns "ok", keep behavior
  // - if server returns JSON with token & user info, persist it
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }

  if (parsed && typeof parsed === 'object') {
    const {
      token,
      id,
      user_id,
      username: uname,
      full_name,
      email,
      roles,
      country,
      address,
      phone_number,
    } = parsed;

    // Store JWT and a compact user snapshot for the rest of the app
    if (token) {
      try { localStorage.setItem('squid.token', token); } catch {}
    }

    const userObj = {
      id: id || user_id || null,
      username: uname || username,
      name: full_name || null,
      email: email || null,
      roles: Array.isArray(roles) ? roles : [],
      country: country || null,
      address: address || null,
      phone: phone_number || null,
      // you can add exp/iat later if you include it in the token claims
    };

    try { localStorage.setItem('squid.user', JSON.stringify(userObj)); } catch {}

    // Return "ok" so existing callers don't change
    return 'ok';
  }

  // Fallback to the old contract if the body was plain text
  return raw || 'ok';
}