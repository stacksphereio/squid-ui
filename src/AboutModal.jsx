// src/AboutModal.jsx
import React from "react";

/**
 * Lightweight, self-contained modal used by the About dialog.
 * No external Modal import required (avoids build/Jest resolution issues).
 */
export default function AboutModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  // close on ESC
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="About Squid UI"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000
      }}
      onClick={onClose}
      data-testid="about-modal"
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          minWidth: 280,
          maxWidth: 520,
          padding: 16,
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>About</h2>
          <button onClick={onClose} aria-label="Close about">✕</button>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
}