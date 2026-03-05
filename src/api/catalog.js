// src/api/catalog.js
function authHeaders() {
  let t = null;
  try { t = localStorage.getItem('squid.token'); } catch {}
  return t ? { 'Authorization': `Bearer ${t}` } : {};
}

export async function listProducts({ limit = 20, offset = 0, category = '' } = {}) {
  let url = `/api/clam-catalog/api/products?limit=${limit}&offset=${offset}`;
  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) throw new Error(`listProducts failed: ${res.status}`);
  return res.json();
}

export async function getProduct(id) {
  const res = await fetch(`/api/clam-catalog/api/products/${encodeURIComponent(id)}`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) throw new Error(`getProduct failed: ${res.status}`);
  return res.json();
}

export async function createProduct(data) {
  const res = await fetch(`/api/clam-catalog/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`createProduct failed: ${res.status}`);
  return res.json();
}

export async function updateProduct(id, data) {
  const res = await fetch(`/api/clam-catalog/api/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`updateProduct failed: ${res.status}`);
  return res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`/api/clam-catalog/api/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      ...authHeaders()
    }
  });
  if (!res.ok) throw new Error(`deleteProduct failed: ${res.status}`);
  return null;
}
