# 🦑 squid-ui

Frontend for **SquidStack**, built with **React** and served by **NGINX**.
Handles user authentication (via `kraken-auth`), exposes admin views, product catalog browsing, integrates with **CloudBees Feature Management (Unify / Rox)**, and ships as a Helm-managed container.

---

## ✨ Features

- **Authentication** against `kraken-auth`
  - `POST /api/kraken-auth/login`
  - Persists JWT (`localStorage.squid.token`)
  - Persists user snapshot (`localStorage.squid.user`)
- **Automatic session management**
  - Auto-logout when JWT expires (`exp` claim)
  - Refreshes feature flag context on login/logout
- **Feature flags** (CloudBees Unify / Rox)
  - Centralized in [`src/flags.js`](src/flags.js)
  - Includes user context (`userId`, `username`, `fullName`, `email`, `country`, `roles`, `isAdmin`)
  - Dynamically controls UI sections and copy:
    - `showTopBannerEnhanced`, `bannerText`, `bannerTone`, `bannerLink`
    - `adminHealth`, `showDebugFooter`
    - `showIntro`, `introTitle`, `introText`
    - `companyName`, `showCompanyName`, `introAudience`
    - `showCloudBeesBrand`, `cloudBeesNote`
    - `adminUsers` → toggles the **Admin → User Admin** section
    - `logLevel` (optional) → controls browser console verbosity
- **Admin → User Admin** (full CRUD operations)
  - Accessible to `admin` or `storeadmin` users
  - Paginated, searchable, sortable user list
  - Role badges and detail view (email, phone, address, country, roles)
  - **Create users**: Modal form with username, password, profile fields, country dropdown (database-driven), and role checkboxes
  - **Edit users**: Update user profiles including full_name, email, phone_number, address, country
  - **Manage roles**: Add/remove roles for users via checkbox interface
  - **Reset passwords**: Admin can reset any user's password
  - **Country validation**: Country dropdown populated from database (201 countries) via `/admin/countries` endpoint
- **Service Health** (flag-gated)
  - Visible to `admin` users when `adminHealth` flag is enabled
- **Auto-wired probes**
  - `/healthz` endpoint (quiet)
  - Liveness & readiness probes configurable via Helm values

---

## 📡 API usage

`squid-ui` uses in-pod NGINX reverse proxies to call backend APIs under a single origin.

| API | Upstream | Example |
|-----|----------|---------|
| Kraken Auth | `kraken-auth:8080` | `/api/kraken-auth/...` |
| Nautilus Inventory | `nautilus-inventory:8084` | `/api/nautilus-inventory/...` |
| Clam Catalog | `clam-catalog:8080` | `/api/clam-catalog/...` |
| Manta Delivery | `manta-delivery:8080` | `/api/manta-delivery/...` |
| Octopus Payments | `octopus-payments:8080` | `/api/octopus-payments/...` |
| Cuttlefish Orders | `cuttlefish-orders:8080` | `/api/cuttlefish-orders/...` |
| Urchin Analytics | `urchin-analytics:8080` | `/api/urchin-analytics/...` |
| Jellyfish Notifications | `jellyfish-notifications:8083` | `/api/jellyfish-notifications/...` |

Each `/api/<service>/` path is rewritten and proxied internally by NGINX; no CORS setup required.

---

## 🔌 Connectivity Architecture

`squid-ui` is the **only service with an external ingress**. All backend services are internal-only and accessed through NGINX reverse proxies running in the squid-ui pod. This architecture eliminates CORS concerns and provides a single point of entry.

### How it works

1. **Browser requests** from the user hit the squid-ui ingress (external-facing)
2. **NGINX** running in the squid-ui container handles all routing:
   - Static assets (HTML, JS, CSS) are served directly from `/usr/share/nginx/html`
   - API calls to `/api/<service>/` are proxied to internal Kubernetes services
   - Asset requests to `/assets/` are proxied to `codlocker-assets` for images
3. **Internal services** communicate directly via Kubernetes service DNS (e.g., `clam-catalog:8080`)
4. **No external ingress** is configured for backend services

### Configuration files

| File | Purpose | Location |
|------|---------|----------|
| `nginx.conf` | Base NGINX configuration with proxy rules | `/squid-ui/nginx.conf` |
| `chart/squid-ui/templates/nginx-configmap.yaml` | Helm template that generates the ConfigMap from nginx.conf | `/squid-ui/chart/squid-ui/templates/` |
| `chart/squid-ui/templates/deployment.yaml` | Mounts the ConfigMap into the pod at `/etc/nginx/conf.d/default.conf` | `/squid-ui/chart/squid-ui/templates/` |

### Example: nginx.conf proxy configuration

The `nginx.conf` file defines all proxy rules:

```nginx
# DNS resolver for Kubernetes service discovery
resolver kube-dns.kube-system.svc.cluster.local valid=10s ipv6=off;

# Service variables (lazy DNS resolution)
set $clam_catalog "clam-catalog:8080";
set $codlocker_assets "codlocker-assets:8080";

# API proxy - strips /api/clam-catalog/ prefix and forwards to service
location /api/clam-catalog/ {
  rewrite ^/api/clam-catalog/?(.*)$ /$1 break;
  proxy_pass http://$clam_catalog;
  proxy_set_header Host $host;
}

# Asset proxy - forwards /assets/ requests to codlocker-assets
location /assets/ {
  proxy_pass http://$codlocker_assets;
  proxy_set_header Host $host;
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# SPA fallback - serves index.html for client-side routing
location / {
  try_files $uri /index.html;
}
```

### Why use variables for upstream services?

NGINX variables like `$clam_catalog` trigger **runtime DNS resolution**. Without variables, NGINX resolves DNS at startup only, which causes failures if backend services aren't ready yet. Variables allow the UI to start successfully even when dependencies are missing.

### Adding a new backend service

To add connectivity to a new backend service:

1. **Add service variable** in `nginx.conf`:
   ```nginx
   set $new_service "new-service:8080";
   ```

2. **Add proxy location block**:
   ```nginx
   location /api/new-service/ {
     rewrite ^/api/new-service/?(.*)$ /$1 break;
     proxy_pass http://$new_service;
     proxy_set_header Host $host;
     proxy_http_version 1.1;
     proxy_set_header Connection "";
   }
   ```

3. **Create API client** in `src/api/` (e.g., `src/api/newservice.js`):
   ```javascript
   export async function getData() {
     const res = await fetch('/api/new-service/data');
     if (!res.ok) throw new Error(`getData failed: ${res.status}`);
     return res.json();
   }
   ```

4. **Commit and push** to trigger redeployment with updated nginx configuration


---

## 🧱 Deployment (Helm / K8s)

`squid-ui` ships with a Helm chart for Kubernetes deployment.

### Health probes

Values in `values.yaml`:

```yaml
probes:
  liveness:
    path: /healthz
    periodSeconds: 10
    timeoutSeconds: 2
    failureThreshold: 3
  readiness:
    path: /healthz
    periodSeconds: 5
    timeoutSeconds: 2
    failureThreshold: 3
```

NGINX implements:

```nginx
location = /healthz { access_log off; add_header Content-Type text/plain; return 200 "ok"; }
```

### Logging

NGINX logs to `/var/log/nginx/access.log`.

- `/healthz` requests are silenced (`access_log off;`)
- Static assets and SPA fallbacks can be quieted or JSON-formatted via Helm values
- Log verbosity switches with **redeploys** (not dynamically at runtime)

Example Helm overrides:

```yaml
logging:
  verbose: false   # full vs quiet
  json: true       # JSON-structured logs
  apiOnly: true    # log only /api/* paths
```

### Feature flags (CloudBees Unify)

The chart supports an init container that mounts your Feature Management environment key (consumed by the UI at `/config/fm.json`).

```yaml
featureFlags:
  enabled: true
  secretName: fm-key
  secretKey: FM_KEY
  mountPath: /usr/share/nginx/html/config
  fileName: fm.json
```

At runtime the app loads:

```json
{ "envKey": "<YOUR_UNIFY_ENV_KEY>" }
```

---

## 🧩 Directory overview

| Path | Description |
|------|-------------|
| `src/api/auth.js` | Handles login, token & user storage |
| `src/api/admin.js` | Admin APIs (`/users`, `/roles`, `/countries`, user CRUD operations) with Bearer token |
| `src/api/http.js` | Shared fetch wrapper & headers |
| `src/flags.js` | Rox flag declarations, snapshot/pub‑sub, user context wiring |
| `src/App.js` | App shell, login/logout, JWT expiry check, flag subscription |
| `src/components/MainView.jsx` | Routes & admin gating |
| `src/components/Modal.jsx` | Reusable modal component with backdrop and close button |
| `src/views/AdminUsers.jsx` | User list view with CRUD modals (create, edit, manage roles, reset password) |
| `src/views/AdminUserDetail.jsx` | Right-side detail sheet |
| `nginx.docker.conf` | Local NGINX for Compose |
| `nginx.conf` | Base NGINX config (K8s image) |
| `chart/squid-ui/templates/nginx-configmap.yaml` | Helm-templated NGINX config |
| `chart/squid-ui/templates/deployment.yaml` | Helm deployment (probes, mounts) |

---

## 🔐 Roles & Gating

| Role | Access |
|------|--------|
| `admin` | Full access (User Admin, Service Health) |
| `storeadmin` | User Admin |
| `user` | Standard user view |

Flags further refine visibility (`adminUsers`, `adminHealth`).

---

## 💾 Local Storage

| Key | Purpose |
|-----|---------|
| `squid.token` | JWT used for API requests |
| `squid.user` | Cached user info (`id`, `username`, `name`, `email`, `roles`, `country`) |

---

## 🔭 Observability Tips

- Tail NGINX logs:
  ```bash
  kubectl -n <ns> logs deploy/squid-ui -f
  ```
- Silence probe noise by using `/healthz` (already configured).
- For API-only logs, set `logging.apiOnly=true` (Helm value) and redeploy.

---

## 📄 License

MIT (demo purposes only)

<!-- Build trigger: 2025-12-11 -->
# Trigger rebuild for nginx config

# Testing Smart Tests CLI fix
# Testing Smart Tests with Java
# Testing junit.xml file attribute fix
# Testing build name without slashes
# Testing subset with test file list
# Verify Node tests still work after Go changes
# Verify Node tests still work after Python XML changes
# Test YAML fix for Node tests
# Test shell-based XML processing for Node

<!-- Test trigger: Thu 22 Jan 2026 10:45:52 GMT -->
# Testing Smart Tests evidence with URL fixes
# Test correct UUID in URLs
# Test cloudbees.io URL format
