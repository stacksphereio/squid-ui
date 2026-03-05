// src/api/admin.js
function authHeaders() {
  let t = null;
  try { t = localStorage.getItem('squid.token'); } catch {}
  return t ? { 'Authorization': `Bearer ${t}` } : {};
}

export async function listUsers({ limit = 200, offset = 0 } = {}) {
  const res = await fetch(`/api/kraken-auth/admin/users?limit=${limit}&offset=${offset}`, {
    headers: { 'Accept': 'application/json', ...authHeaders() }
  });
  if (!res.ok) throw new Error(`listUsers failed: ${res.status}`);
  return res.json();
}

export async function getUser(id) {
  const res = await fetch(`/api/kraken-auth/admin/users/${encodeURIComponent(id)}`, {
    headers: { 'Accept': 'application/json', ...authHeaders() }
  });
  if (!res.ok) throw new Error(`getUser failed: ${res.status}`);
  return res.json();
}

export async function listRoles() {
  const res = await fetch(`/api/kraken-auth/admin/roles`, {
    headers: { 'Accept': 'application/json', ...authHeaders() }
  });
  if (!res.ok) throw new Error(`listRoles failed: ${res.status}`);
  return res.json();
}

export async function listCountries() {
  const res = await fetch(`/api/kraken-auth/admin/countries`, {
    headers: { 'Accept': 'application/json', ...authHeaders() }
  });
  if (!res.ok) throw new Error(`listCountries failed: ${res.status}`);
  return res.json();
}

export async function createUser(userData) {
  const res = await fetch(`/api/kraken-auth/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`createUser failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function updateUser(id, userData) {
  const res = await fetch(`/api/kraken-auth/admin/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`updateUser failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function updateUserRoles(id, roles) {
  const res = await fetch(`/api/kraken-auth/admin/users/${encodeURIComponent(id)}/roles`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify({ roles })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`updateUserRoles failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function resetUserPassword(id, password) {
  const res = await fetch(`/api/kraken-auth/admin/users/${encodeURIComponent(id)}/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify({ password })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`resetUserPassword failed (${res.status}): ${text}`);
  }
  return res.json();
}