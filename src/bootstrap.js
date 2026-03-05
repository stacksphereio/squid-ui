// src/bootstrap.js
export async function loadRuntimeConfig() {
  // This file is written at container start (in K8s by an initContainer,
  // in docker-compose by the container command)
  const res = await fetch('/config/fm.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`fm config load failed: ${res.status}`);
  const cfg = await res.json();           // { envKey: "..." }
  window.__FM = cfg;                      // make available globally if you like
  return cfg;
}