// src/components/NavBar.jsx
import React from "react";

export default function NavBar({
  isLoggedIn,
  adminHealthEnabled,
  onGoHome,
  onOpenAbout,
  onOpenAdminHealth,
  onLogout,
  username
}) {
  const [openMenu, setOpenMenu] = React.useState(null); // "about" | "admin" | null
  const toggleMenu = (id) => setOpenMenu((cur) => (cur === id ? null : id));
  const closeMenus = () => setOpenMenu(null);

  const navBtn = {
    background: "transparent",
    border: 0,
    cursor: "pointer",
    padding: "6px 8px",
    font: "inherit"
  };
  const menuWrap = { position: "relative" };
  const menu = {
    position: "absolute",
    top: "100%",
    left: 0,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 6,
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    minWidth: 220,
    padding: 6,
    zIndex: 20
  };
  const item = {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "8px 10px",
    background: "transparent",
    border: 0,
    borderRadius: 4,
    cursor: "pointer"
  };

  return (
    <header
      style={{
        padding: 12,
        borderBottom: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "#fff",
        zIndex: 10
      }}
      onClick={closeMenus}
    >
      <strong style={{ fontSize: 18 }}>Squid UI</strong>

      {/* NAV only when logged in */}
      {isLoggedIn && (
        <nav aria-label="Main" style={{ display: "flex", gap: 12 }} onClick={(e) => e.stopPropagation()}>
          {/* Home */}
          <button style={navBtn} onClick={() => { onGoHome(); closeMenus(); }}>
            Home
          </button>

          {/* About (opens modal) */}
          <div style={menuWrap}>
            <button
              style={navBtn}
              aria-haspopup="menu"
              aria-expanded={openMenu === "about"}
              onClick={(e) => { e.stopPropagation(); toggleMenu("about"); }}
            >
              About ▾
            </button>
            {openMenu === "about" && (
              <div role="menu" style={menu} onClick={(e) => e.stopPropagation()}>
                <button
                  role="menuitem"
                  style={item}
                  onClick={() => { onOpenAbout(); closeMenus(); }}
                >
                  Overview
                </button>
                {/* Future: Version item */}
              </div>
            )}
          </div>

          {/* Admin (flag-gated dropdown) */}
          {adminHealthEnabled && (
            <div style={menuWrap}>
              <button
                style={navBtn}
                aria-haspopup="menu"
                aria-expanded={openMenu === "admin"}
                onClick={(e) => { e.stopPropagation(); toggleMenu("admin"); }}
              >
                Admin ▾
              </button>
              {openMenu === "admin" && (
                <div role="menu" style={menu} onClick={(e) => e.stopPropagation()}>
                  <button
                    role="menuitem"
                    style={item}
                    onClick={() => { onOpenAdminHealth(); closeMenus(); }}
                  >
                    Service health
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      )}

      <div>
        {isLoggedIn ? (
          <>
            <span style={{ marginRight: 8 }}>
              Hello, {username || "user"}
            </span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : null}
      </div>
    </header>
  );
}