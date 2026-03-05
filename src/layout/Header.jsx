import React from "react";
import ReactCountryFlag from "react-country-flag";

export default function Header({
  isLoggedIn,
  isAdmin,
  adminHealthEnabled,
  adminUsersEnabled,
  productsEnabled,
  user,
  onLogout,
  onShowAbout,
  onNavigate,
  menuOpen,
  setMenuOpen,
  featureCountry, // ← from App.js
  welcomeStatement, // ← from App.js
}) {
  React.useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      const menu = document.querySelector(".nav-menu");
      const trigger = document.querySelector("[data-testid='menu-button']");
      if (menu && !menu.contains(e.target) && trigger && !trigger.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen, setMenuOpen]);

  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const isStoreAdmin = roles.includes("storeadmin");
  const canAdminUsers = (isAdmin || isStoreAdmin) && !!adminUsersEnabled;

  // --- Determine which flag to show ---
  const asCC = (v) =>
    typeof v === "string" && /^[A-Za-z]{2}$/.test(v.trim()) ? v.trim().toUpperCase() : "";
  const cc =
    asCC(user?.countryCode) ||
    asCC(featureCountry) ||
    "";

  return (
    <header className="topbar" style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {isLoggedIn && (
          <div className="menu-wrap">
            <button
              type="button"
              data-testid="menu-button"
              className="btn burger"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              title="Menu"
            >
              <span className="burger-lines" aria-hidden="true" />
              <span className="sr-only">Menu</span>
            </button>

            {menuOpen && (
              <div className="nav-menu" role="menu" aria-label="Main menu">
                <button
                  className="nav-item"
                  role="menuitem"
                  onClick={() => {
                    onNavigate("home");
                    setMenuOpen(false);
                  }}
                >
                  Home
                </button>

                {productsEnabled && (
                  <button
                    className="nav-item"
                    role="menuitem"
                    data-testid="products-item"
                    onClick={() => {
                      onNavigate("products");
                      setMenuOpen(false);
                    }}
                  >
                    Products
                  </button>
                )}

                {isAdmin && adminHealthEnabled && (
                  <button
                    className="nav-item"
                    role="menuitem"
                    data-testid="admin-item-health"
                    onClick={() => {
                      onNavigate("admin-health");
                      setMenuOpen(false);
                    }}
                  >
                    Service health
                  </button>
                )}

                {canAdminUsers && (
                  <button
                    className="nav-item"
                    role="menuitem"
                    data-testid="admin-item-users"
                    onClick={() => {
                      onNavigate("admin-users");
                      setMenuOpen(false);
                    }}
                  >
                    User admin
                  </button>
                )}

                <button
                  className="nav-item"
                  role="menuitem"
                  onClick={() => {
                    onShowAbout();
                    setMenuOpen(false);
                  }}
                >
                  About
                </button>
              </div>
            )}
          </div>
        )}
        <strong className="brand">Squid Stack</strong>
      </div>

      <div className="grow-spacer" />

      <div className="actions">
        {isLoggedIn && (
          <div className="userbox" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Flag to the left of the username */}
            {cc && (
              <ReactCountryFlag
                countryCode={cc}
                svg
                style={{ width: 16, height: 16, borderRadius: 3 }}
                title={cc}
                aria-label={cc}
              />
            )}
            <span className="hello">
              {welcomeStatement || "Hello"},{" "}
              {(user?.name || user?.full_name || user?.username || "user")}
              {isAdmin && " (admin)"}
            </span>
            <button className="btn" onClick={onLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}