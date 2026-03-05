// src/views/AdminUserDetail.jsx
import React from "react";

export default function AdminUserDetail({ userId, onClose }) {
  // Parent handles fetching + rendering detail content inside <RightSheet>.
  if (!userId) return null;
  return null;
}

// Reusable right-side sheet (used by AdminUsers)
export function RightSheet({ title, children, onClose }) {
  const bodyRef = React.useRef(null);

  // Close on ESC
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent backdrop click from closing when clicking inside the panel
  const stop = (e) => e.stopPropagation();

  // Focus the sheet body for keyboard scrolling
  React.useEffect(() => {
    bodyRef.current?.focus?.();
  }, []);

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <aside
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title || "User details"}
        onClick={stop}
      >
        <header className="sheet-header">
          <h3 className="h3" style={{ margin: 0 }}>{title}</h3>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </header>
        <div
          ref={bodyRef}
          className="sheet-body"
          tabIndex={-1}
        >
          {children}
        </div>
      </aside>
    </>
  );
}