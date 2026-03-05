// src/components/Modal.jsx
import React from "react";

export default function Modal({ title, children, onClose }) {
  React.useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          width: "min(700px, 92vw)",
          maxHeight: "80vh",
          borderRadius: 12,
          boxShadow: "0 18px 60px rgba(0,0,0,0.2)",
          overflow: "hidden"
        }}
      >
        <header
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <strong>{title}</strong>
          <button onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div style={{ padding: 16, overflow: "auto" }}>{children}</div>
      </div>
    </div>
  );
}