// Central registry of services the UI knows about.
// requiredBy: "ui" | "other"
export const SERVICES = [
  {
    key: "squid-auth",
    name: "Squid Auth",
    url: "/api/squid-auth/health",
    requiredBy: "ui",
    notes: "Authentication service",
  },
  {
    key: "squid-catalog",
    name: "Squid Catalog",
    url: "/api/squid-catalog/health",
    requiredBy: "ui",
    notes: "Product catalog API",
  },
  {
    key: "squid-assets",
    name: "Squid Assets",
    url: "/api/squid-assets/health",
    requiredBy: "ui",
    notes: "Asset serving service",
  },
  {
    key: "squid-feeds",
    name: "Squid Feeds",
    url: "/api/squid-feeds/health",
    requiredBy: "ui",
    notes: "Feed aggregation service",
  },
];