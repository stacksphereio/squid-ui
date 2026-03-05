// src/components/Intro.jsx
import React from "react";

/**
 * Intro card shown on the welcome screen.
 * Self-guards against rendering when a user is logged in, even if mounted by mistake.
 *
 * You can optionally pass isLoggedIn to override detection; otherwise it checks localStorage.
 */
export default function Intro({
  title,
  text,
  companyName = "",
  showCloudBeesBrand = false,
  cloudBeesNote = "",
  isLoggedIn, // optional override
}) {
  // Determine logged-in state:
  // 1) use the prop if provided
  // 2) fall back to presence of squid.user in localStorage
  let loggedIn = false;
  try {
    if (typeof isLoggedIn === "boolean") {
      loggedIn = isLoggedIn;
    } else {
      const raw = localStorage.getItem("squid.user");
      loggedIn = !!(raw && JSON.parse(raw));
    }
  } catch {
    // ignore parse errors; treat as logged out
  }

  // Hard guard: never render when logged in
  if (loggedIn) return null;

  return (
    <section className="intro-card" role="region" aria-label="Introduction">
      <div className="intro-hero">
        <div className="intro-emoji" aria-hidden="true">🦑</div>
        <h2 className="intro-title">
          {title || "Welcome"}
          {companyName ? <span className="intro-subtitle"> — {companyName}</span> : null}
        </h2>
      </div>

      <p className="intro-tagline">
        An <strong>ink-credible</strong> demo wholesaler experience—great for showcasing
        multi-component apps, feature flags, and progressive delivery.
      </p>

      {text ? <p className="intro-text">{text}</p> : null}

      <ul className="intro-list">
        <li>Toggle UI sections safely with Feature Management.</li>
        <li>Demonstrate admin-only views (e.g., Service health).</li>
        <li>Roll out changes gradually and measure impact.</li>
      </ul>

      {showCloudBeesBrand && cloudBeesNote ? (
        <p className="intro-powered">
          <span className="intro-dot" aria-hidden="true">•</span> {cloudBeesNote}
        </p>
      ) : null}
    </section>
  );
}