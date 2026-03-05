// src/layout/Sidebar.jsx
import React from "react";

export default function Sidebar({ onNavigate, current }) {
  return (
    <aside className="sidebar" aria-label="Admin navigation">
      <div className="sidebar-section">
        <div className="sidebar-title">User Admin</div>
        <button
          className={`nav-link ${current === 'admin-users' ? 'active' : ''}`}
          onClick={() => onNavigate('admin-users')}
        >
          List users
        </button>
      </div>
    </aside>
  );
}