// src/components/MainView.jsx
import React from "react";
import HealthDashboard from "./HealthDashboard";
import AdminUsers from "../views/AdminUsers";
import Products from "../views/Products";
import ReefFeedPanel from "./ReefFeedPanel";

export default function MainView({ user, isAdmin, view, setView, flagSnap = {} }) {
  const { adminHealth, products: productsFlag } = flagSnap;

  // Gate for admin features: admin OR storeadmin role
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const isStoreAdmin = roles.includes("storeadmin");

  // ALSO require the FM flag ui.adminUsers
  const canAdminUsers = (isAdmin || isStoreAdmin) && !!flagSnap.adminUsers;

  return (
    <main className="main">
      <div className="main-grid">
        <section className="content">
          {/* Home */}
          {view === "home" && (
            <div className="home-page">
              <div className="hero-section">
                <div className="hero-content">
                  <h1 className="hero-title">Welcome to Squid Stack</h1>
                  <p className="hero-subtitle">Your seafood e-commerce platform</p>
                </div>
              </div>

              {flagSnap.reefFeed && <ReefFeedPanel />}

              <div className="feature-cards">
                {productsFlag && (
                  <button
                    className="feature-card"
                    onClick={() => setView("products")}
                  >
                    <div className="feature-icon">🐟</div>
                    <h3 className="feature-title">Browse Products</h3>
                    <p className="feature-description">Explore our fresh seafood catalog</p>
                  </button>
                )}

                {canAdminUsers && (
                  <button
                    className="feature-card"
                    onClick={() => setView("admin-users")}
                  >
                    <div className="feature-icon">👥</div>
                    <h3 className="feature-title">User Administration</h3>
                    <p className="feature-description">Manage users and roles</p>
                  </button>
                )}

                {isAdmin && adminHealth && (
                  <button
                    className="feature-card"
                    onClick={() => setView("admin-health")}
                  >
                    <div className="feature-icon">📊</div>
                    <h3 className="feature-title">Service Health</h3>
                    <p className="feature-description">Monitor system status</p>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Admin → Service health (existing) */}
          {view === "admin-health" && isAdmin && adminHealth && (
            <>
              <button type="button" className="btn-home" onClick={() => setView("home")}>
                ← Home
              </button>
              <HealthDashboard />
            </>
          )}

          {/* Admin → User Admin → List users (new) */}
          {view === "admin-users" && canAdminUsers && (
            <>
              <button type="button" className="btn-home" onClick={() => setView("home")}>
                ← Home
              </button>
              <AdminUsers />
            </>
          )}

          {/* Products Catalog (public) */}
          {view === "products" && productsFlag && (
            <>
              <button type="button" className="btn-home" onClick={() => setView("home")}>
                ← Home
              </button>
              <Products />
            </>
          )}
        </section>
      </div>
    </main>
  );
}