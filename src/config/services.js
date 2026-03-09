// Central registry of services the UI knows about.
// requiredBy: "ui" | "other"
export const SERVICES = [
  {
    key: "squid-auth",
    name: "Squid Auth",
    url: "/api/kraken-auth/health",
    requiredBy: "ui",
    notes: "Authentication service",
  },
  {
    key: "squid-catalog",
    name: "Squid Catalog",
    url: "/api/clam-catalog/health",
    requiredBy: "ui",
    notes: "Product catalog API",
  },
  {
    key: "squid-feeds",
    name: "Squid Feeds",
    url: "/api/reef-feed-aggregator/health",
    requiredBy: "ui",
    notes: "Feed aggregation service",
  },
];