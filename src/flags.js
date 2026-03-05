// src/flags.js
import Rox from 'rox-browser';
import { dlog } from './util/debug';

function safeGetString(conf, fallback = '') {
  try {
    const v = conf.getValue();
    return (typeof v === 'string') ? v : fallback;
  } catch (e) {
    console.warn('[FM] getValue() failed for string config:', e);
    return fallback;
  }
}

// ---- Declare all flags here (namespace: ui) ----
// IMPORTANT: keep keys exactly as defined in Unify.
export const flags = {
  showTopBannerEnhanced: new Rox.Flag(false),
  bannerText:            new Rox.RoxString('Black Friday: 25 percent off everything!', []),
  bannerTone:            new Rox.RoxString('promo', ['info','warning','promo']),
  bannerLink:            new Rox.RoxString('', []),
  welcome_statement: new Rox.RoxString('Hello', []),

  adminHealth:     new Rox.Flag(true),
  showDebugFooter: new Rox.Flag(false),

  // Intro (shown when logged out)
  showIntro:  new Rox.Flag(true),
  introTitle: new Rox.RoxString('Welcome to Squid UI', []),
  introText:  new Rox.RoxString(
    'Squid Stack is a demo wholesaler experience. Use it to showcase feature management, toggled UI, and progressive rollout scenarios.',
    []
  ),

  // Personalization
  companyName:     new Rox.RoxString('Squid Stack', []),
  showCompanyName: new Rox.Flag(true),
  introAudience:   new Rox.RoxString('wholesalers', ['wholesalers','distributors','partners']),

  // Branding
  showCloudBeesBrand: new Rox.Flag(true),
  cloudBeesNote:      new Rox.RoxString('Built with CloudBees Unify', []),

  // Admin
  adminUsers: new Rox.Flag(false),

  // Products
  products: new Rox.Flag(false),

  // Reef Feeds
  reefFeed: new Rox.Flag(false),

   // Observability
  logLevel: new Rox.RoxString('info', ['off','error','warn','info','debug']),

};

// Register under one namespace
Rox.register('squidstack.ui', flags);

// Internal snapshot (null until we evaluate AFTER setup)
let _snapshot = null;
const listeners = new Set();

export function getFlagsSnapshot() { return _snapshot || {}; }
export function subscribeFlags(cb) { listeners.add(cb); return () => listeners.delete(cb); }

function buildSnapshot() {
  // Single evaluation point
  return {
    showTopBannerEnhanced: flags.showTopBannerEnhanced.isEnabled(),
    bannerText:            safeGetString(flags.bannerText, 'Today only: big savings!'),
    bannerTone:            safeGetString(flags.bannerTone, 'info'),
    bannerLink:            safeGetString(flags.bannerLink, ''),
    welcome_statement:      safeGetString(flags.welcome_statement, 'Hello'),

    adminHealth:     flags.adminHealth.isEnabled(),
    showDebugFooter: flags.showDebugFooter.isEnabled(),
    adminUsers:      flags.adminUsers.isEnabled(),
    products:        flags.products.isEnabled(),
    reefFeed:        flags.reefFeed.isEnabled(),

    showIntro:  flags.showIntro.isEnabled(),
    introTitle: flags.introTitle.getValue(),
    introText:  flags.introText.getValue(),

    companyName:     flags.companyName.getValue(),
    showCompanyName: flags.showCompanyName.isEnabled(),
    introAudience:   flags.introAudience.getValue(),

    showCloudBeesBrand: flags.showCloudBeesBrand.isEnabled(),
    cloudBeesNote:      flags.cloudBeesNote.getValue(),
     // Observability
    logLevel: safeGetString(flags.logLevel, 'info'),

  };
}

/** Optional: warm caches once after setup */
export function primeFlags() {
  try {
    void flags.showIntro.isEnabled();
    void flags.bannerText.getValue();
    void flags.welcome_statement.getValue();
    void flags.bannerTone.getValue();
    void flags.bannerLink.getValue();
    void flags.showTopBannerEnhanced.isEnabled();
    void flags.adminHealth.isEnabled();
    void flags.showDebugFooter.isEnabled();
    void flags.introTitle.getValue();
    void flags.introText.getValue();
    void flags.companyName.getValue();
    void flags.showCompanyName.isEnabled();
    void flags.introAudience.getValue();
    void flags.showCloudBeesBrand.isEnabled();
    void flags.cloudBeesNote.getValue();
    void flags.adminUsers.isEnabled();
    void flags.products.isEnabled();
    void flags.reefFeed.isEnabled();
    void flags.logLevel.getValue();
  } catch (e) {
    console.warn('[FM] primeFlags error', e);
  }
}

/** Rebuild snapshot AFTER Rox.setup() or when Rox.fetch() completes */
export function setFlagsSnapshot(reason = 'update') {
  _snapshot = buildSnapshot();
  dlog?.('[FM] flags updated:', reason, { ..._snapshot });
  for (const fn of listeners) {
    try { fn(reason, getFlagsSnapshot()); } catch {}
  }
}

/** One-shot forced evaluation AFTER setup, to ensure impressions are sent */
export function evaluateAllForImpressions() {
  try {
    void flags.showTopBannerEnhanced.isEnabled();
    void flags.bannerText.getValue();
    void flags.bannerTone.getValue();
    void flags.bannerLink.getValue();

    void flags.adminHealth.isEnabled();
    void flags.showDebugFooter.isEnabled();
    void flags.adminUsers.isEnabled();
    void flags.products.isEnabled();
    void flags.reefFeed.isEnabled();

    void flags.showIntro.isEnabled();
    void flags.introTitle.getValue();
    void flags.introText.getValue();

    void flags.companyName.getValue();
    void flags.showCompanyName.isEnabled();
    void flags.introAudience.getValue();

    void flags.showCloudBeesBrand.isEnabled();
    void flags.cloudBeesNote.getValue();
    void flags.welcome_statement.getValue();

    dlog?.('[FM] evaluateAllForImpressions: done');
  } catch (e) {
    console.warn('[FM] evaluateAllForImpressions error', e);
  }
}

/** Expose current user to FM for targeting */
export function wireUserContext() {
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem('squid.user') || 'null') || {}; }
    catch { return {}; }
  };

  Rox.setCustomStringProperty('email', () => String(getUser().email || ''));
  Rox.setCustomStringProperty('userId',   () => String(getUser().id || getUser().user_id || ''));
  Rox.setCustomStringProperty('username', () => String(getUser().username || ''));
  Rox.setCustomStringProperty('fullName', () => String(getUser().name || getUser().full_name || ''));
  Rox.setCustomStringProperty('country',  () => String(getUser().country || ''));

  Rox.setCustomStringProperty('roles', () => {
    const roles = Array.isArray(getUser().roles) ? getUser().roles : [];
    return roles.join(',');
  });

  Rox.setCustomStringProperty('emailDomain', () => {
  try {
    const e = (getUser().email || '').toLowerCase().trim();
    const at = e.lastIndexOf('@');
    return at > 0 ? e.slice(at + 1) : '';
  } catch { return ''; }
});

  Rox.setCustomBooleanProperty('isAdmin', () => {
    const roles = Array.isArray(getUser().roles) ? getUser().roles : [];
    return roles.includes('admin');
  });

  dlog?.('FM user context wired');
}

/** Ask Unify to re-evaluate rules (e.g., after login/logout) */
export async function refreshFlags() {
  try {
    if (typeof Rox?.fetch === 'function') {
      dlog?.('FM refreshFlags → Rox.fetch()');
      await Rox.fetch();
      evaluateAllForImpressions();
      setFlagsSnapshot('Rox.fetch()');
    }
  } catch (e) {
    console.warn('[FM] refreshFlags failed', e);
  }
}