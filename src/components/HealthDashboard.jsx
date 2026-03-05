import React from "react";
import { SERVICES } from "../config/services";

function StatusBadge({ status }) {
  const ok = status === 200;
  const base = "inline-flex items-center px-2 py-0.5 rounded text-sm font-medium";
  const good = "background-color:#dcfce7;color:#166534;"; // green-ish
  const bad  = "background-color:#fee2e2;color:#991b1b;"; // red-ish
  return (
    <span style={{ ...(ok ? {} : {}), cssText: `${base}; ${ok ? good : bad}` }}>
      {ok ? "Healthy" : status === 0 ? "Unreachable" : `HTTP ${status}`}
    </span>
  );
}

export default function HealthDashboard() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const abortRef = React.useRef(null);

  const checkAll = React.useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    try {
      const results = await Promise.allSettled(
        SERVICES.map(async (svc) => {
          const t0 = performance.now();
          try {
            const res = await fetch(svc.url, { signal: ac.signal });
            const ms = Math.round(performance.now() - t0);
            return { ...svc, status: res.status, ms };
          } catch {
            const ms = Math.round(performance.now() - t0);
            return { ...svc, status: 0, ms };
          }
        })
      );
      setRows(results.map((r, i) => (r.status === "fulfilled" ? r.value : { ...SERVICES[i], status: 0, ms: 0 })));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    checkAll();
    return () => abortRef.current?.abort();
  }, [checkAll]);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>Admin · Service Health</h2>
      <p style={{ marginBottom: 16, color: "#555" }}>
        Same‑origin checks via Nginx proxy. Works in Docker Compose and K8S.
      </p>

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={checkAll}
          disabled={loading}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: loading ? "#f5f5f5" : "white",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Checking..." : "Re-run checks"}
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
              <th style={{ padding: 8 }}>Service</th>
              <th style={{ padding: 8 }}>URL</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Latency</th>
              <th style={{ padding: 8 }}>Required By</th>
              <th style={{ padding: 8 }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} style={{ borderBottom: "1px solid #f3f3f3" }}>
                <td style={{ padding: 8 }}>{r.name}</td>
                <td style={{ padding: 8 }}>
                  <code>{r.url}</code>
                </td>
                <td style={{ padding: 8 }}>
                  <StatusBadge status={r.status} />
                </td>
                <td style={{ padding: 8 }}>{r.ms ? `${r.ms} ms` : "—"}</td>
                <td style={{ padding: 8 }}>{r.requiredBy === "ui" ? "UI" : "Other"}</td>
                <td style={{ padding: 8, color: "#666" }}>{r.notes}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={6} style={{ padding: 12, color: "#888" }}>
                No results yet.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 12, color: "#888" }}>
        Tip: 404 = service running but <code>/health</code> missing. 000 = can’t connect (container down / DNS / port).
      </p>
    </div>
  );
}