// src/App.js
// Testing Smart Tests prioritization - this comment triggers test prioritization
import React from "react";
import Login from "./Login";
import MainView from "./components/MainView";
import AboutModal from "./AboutModal";
import {
  getFlagsSnapshot,
  subscribeFlags,
  wireUserContext,
  refreshFlags
} from "./flags";
import Intro from "./components/Intro";
import TopBanner from "./layout/TopBanner";
import Header from "./layout/Header";
import { dlog, setDebugFromFlags, setLogLevel } from "./util/debug";
import { isExpired, msUntilExpiry } from "./util/jwt";

function App() {
  // --- auth ---
  const [user, setUser] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("squid.user") || "null"); }
    catch { return null; }
  });
  const isLoggedIn = !!user;
  const isAdmin = Array.isArray(user?.roles) ? user.roles.includes("admin") : !!user?.isAdmin;

  // --- views: home | admin-health | admin-users
  const [view, setView] = React.useState("home");

  // --- modals/menus ---
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  // --- flags snapshot ---
  const [flagSnap, setFlagSnap] = React.useState(() => getFlagsSnapshot() || {});
  React.useEffect(() => subscribeFlags((_reason, snap) => setFlagSnap(snap || {})), []);

  // Let FM toggle client logs via the showDebugFooter flag
  React.useEffect(() => { setDebugFromFlags(!!flagSnap?.showDebugFooter); }, [flagSnap]);

  // Expose (possibly anonymous) user context to FM once on mount
  React.useEffect(() => { try { wireUserContext(); dlog('wireUserContext on mount'); } catch {} }, []);

  // Use the Enhanced flag (matches Unify key exactly)
  const showTopBanner     = !!flagSnap?.showTopBannerEnhanced;
  const bannerText        = flagSnap?.bannerText;
  const bannerTone        = (flagSnap?.bannerTone || 'info').toLowerCase();
  const bannerLink        = flagSnap?.bannerLink;

  const adminHealthEnabled = !!flagSnap?.adminHealth;
  const showDebugFooter    = !!flagSnap?.showDebugFooter;

  const showIntro  = !!flagSnap?.showIntro;
  const introTitle = flagSnap?.introTitle;
  const introText  = flagSnap?.introText;

  const showCloudBeesBrand = !!flagSnap?.showCloudBeesBrand;
  const cloudBeesNote      = flagSnap?.cloudBeesNote;
  const companyName = flagSnap?.showCompanyName ? (flagSnap?.companyName || "") : "";

  // Only show Intro when logged out
  const shouldShowIntro = showIntro && !isLoggedIn;

  const handleLogin = (_fromFormUser) => {
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem("squid.user") || "null"); } catch {}
    const normalized = stored ? {
      ...stored,
      name: stored.name || stored.full_name || stored.username || "user",
      roles: Array.isArray(stored.roles) ? stored.roles : [],
      isAdmin: Array.isArray(stored?.roles) ? stored.roles.includes("admin") : !!_fromFormUser?.isAdmin,
    } : { username: _fromFormUser?.username, isAdmin: !!_fromFormUser?.isAdmin };

    try { localStorage.setItem("squid.user", JSON.stringify(normalized)); } catch {}
    setUser(normalized);
    setView("home");

    dlog('login complete; user normalized', normalized);
    try { wireUserContext(); } catch {}
    refreshFlags(); // triggers config refetch + new snapshot
  };

  const handleLogout = () => {
    try { localStorage.removeItem("squid.user"); } catch {}
    try { localStorage.removeItem("squid.token"); } catch {}
    setUser(null);
    setView("home");
    setAboutOpen(false);
    setMenuOpen(false);

    dlog('logout complete; user cleared');
    try { wireUserContext(); } catch {}
    refreshFlags();
  };

  // close menu when clicking outside
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
  }, [menuOpen]);

  // --- auto logout when JWT expires ---
  React.useEffect(() => {
    let timer;
    try {
      if (isExpired()) {
        dlog('JWT expired → clearing session now');
        localStorage.removeItem('squid.user');
        localStorage.removeItem('squid.token');
        window.location.reload();
        return;
      }
      const left = msUntilExpiry();
      if (left && left > 0 && left < 24 * 60 * 60 * 1000) {
        dlog('JWT will expire in ms', left);
        timer = setTimeout(() => {
          dlog('JWT expiry reached → clearing session');
          localStorage.removeItem('squid.user');
          localStorage.removeItem('squid.token');
          window.location.reload();
        }, left + 250);
      }
    } catch (e) {
      dlog('auto logout check failed', e);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, []);

  return (
    <div className="app">
      <TopBanner
        show={showTopBanner}
        text={bannerText}
        tone={bannerTone}
        link={bannerLink}
      />

      <Header
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        adminHealthEnabled={adminHealthEnabled}
        adminUsersEnabled={!!flagSnap.adminUsers}
        productsEnabled={!!flagSnap.products}
        user={user}
        onLogout={handleLogout}
        onShowAbout={() => setAboutOpen(true)}
        onNavigate={(route) => setView(route)}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        featureCountry={flagSnap?.country || user?.countryCode || user?.country || ""}
        welcomeStatement={flagSnap?.welcome_statement || "Hello"}
      />

      {/* About modal */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)}>
        <p>This is Squid UI.</p>
      </AboutModal>

      {/* Main */}
      {!isLoggedIn ? (
        <main className="main two-col">
          <div className="col">
            <Login onLogin={handleLogin} />
          </div>
          <div className="col">
            {shouldShowIntro && (
              <Intro
                title={introTitle}
                text={introText}
                companyName={companyName}
                showCloudBeesBrand={showCloudBeesBrand}
                cloudBeesNote={cloudBeesNote}
              />
            )}
          </div>
        </main>
      ) : (
        <MainView
          user={user}
          isAdmin={isAdmin}
          view={view}
          setView={setView}
          flagSnap={flagSnap}
        />
      )}

      {showDebugFooter && (
        <pre className="debug-footer" data-testid="debug-footer">
          [FM] flags snapshot: {JSON.stringify(flagSnap)}
        </pre>
      )}
    </div>
  );
}

export default App;