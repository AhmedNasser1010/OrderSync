# `ERR_REQUIRE_ESM` on Vercel — `firebase-admin` × `jose` Mismatch

This document describes a production-only crash in `customer_app` (order placement) caused by a CJS/ESM mismatch inside the `firebase-admin` dependency tree, the root cause, the fix applied (downgrade to `firebase-admin@13`), and how to avoid regressions.

## Overview

Every app in this monorepo uses `firebase-admin` for server-side Auth/Firestore access (`initAdmin` → `getAuth` → `getFirestore`).

After a dependency bump to `firebase-admin@14`, the deployed app started crashing on Vercel with:

```
Error: Failed to load external module firebase-admin-c8c8ef6e3afa2c6f/auth:
Error [ERR_REQUIRE_ESM]: require() of ES Module
/var/task/customer_app/node_modules/jose/dist/webapi/index.js
from /var/task/customer_app/node_modules/jwks-rsa/src/utils.js not supported.
```

The app worked locally and only failed in production, so it took several steps to isolate the real cause.

## Symptoms

- Works locally (`npm run dev`, `next build`, `next start`).
- Crashes at runtime on Vercel the moment a server-side `firebase-admin` module (`/auth`) is loaded — i.e. when placing an order.
- The bundle **already** externalizes `firebase-admin` correctly (see below), so bundling was never the issue.

## Root Cause

Three things combine:

### 1. `firebase-admin@14` pulled in `jwks-rsa@4` → `jose@6`

The version chain that landed in the lockfile:

```
firebase-admin@14.2.0
  └─ jwks-rsa@4.1.0   (CommonJS — uses require())
       └─ jose@6.2.6  (ESM-only — ships NO CommonJS build)
```

`jwks-rsa`'s `src/utils.js` does `const jose = require("jose")` at module load. `jose@6` is an **ESM-only** package (`"type": "module"`), so `require()` throws `ERR_REQUIRE_ESM`.

### 2. Node version difference between local and Vercel

`require()` of an ES Module is only supported from Node **v22.12+**. The local machine runs Node `v22.22.2` (works), while Vercel's runtime was older than 22.12 (fails). Same bundle, same code — the only difference is the runtime Node version.

### 3. Bundling was already correct, so config-only fixes could not help

- `firebase-admin` is already in Next.js's default external list (`next/dist/lib/server-external-packages.jsonc`, line 44). Turbopack externalizes it at build time via a symlink (`customer_app/.next/node_modules/firebase-admin-<hash>` → real `node_modules/firebase-admin`) and the server chunk calls `require("firebase-admin-<hash>/auth")` at runtime.
- `serverExternalPackages: ["firebase-admin"]` → no-op (already external).
- `transpilePackages: ["jose", "jwks-rsa"]` → no effect; `transpilePackages` only affects the bundled graph, and Turbopack never traces into an externalized package.

Since the deployed bundle depends on the **runtime** resolving `require("jose")` from the external `firebase-admin` tree, the only real fixes are: use a newer Node runtime on Vercel (≥22.12), or make the installed tree CJS-compatible (i.e. don't ship `jose@6` to `jwks-rsa@4`).

## The Fix

### A. Downgrade `firebase-admin` to `13.x` in every app

`firebase-admin@13` depends on `jwks-rsa@3` which depends on `jose@4` — a **CommonJS** build, so `require("jose")` works everywhere:

```
firebase-admin@13.10.0
  └─ jwks-rsa@3.2.2   (CommonJS)
       └─ jose@4.15.9 (dual CJS/ESM — require() supported)
```

Changed in `customer_app`, `driver_app`, `onboarding_app`, `orders_app`:

```json
"firebase-admin": "^13.10.0",
```

(`manager_app` was already on `^13.4.0` and is unaffected.)

The downgrade is API-safe: all apps only import `firebase-admin/app`, `/auth`, `/firestore`, `/messaging`, which are identical between v13 and v14. No code changes were needed.

### B. Regenerate the lockfile — clean install from scratch

The first `npm install` after editing `package.json` did **not** fix the tree. The root `package-lock.json` had been polluted with stale per-app entries like `customer_app/node_modules/firebase-admin → 14.2.0`, and npm kept carrying them forward across installs:

- Installing with a stale lockfile → reuses the old 14.x entries.
- Deleting the lockfile but keeping the dirty on-disk `node_modules` → npm's "KEEP" logic re-imports the stale directories back into the fresh lockfile.

Only removing **both** `node_modules` **and** `package-lock.json` in the same pass produced a clean resolve:

```bash
find . -maxdepth 4 -type d -name node_modules -not -path "*/firebase-data-clone/*" | xargs rm -rf
rm -f package-lock.json
npm install
```

After this, `npm ls firebase-admin jwks-rsa jose` shows a single hoisted, correct tree:

```
node_modules/firebase-admin → 13.10.0
node_modules/jwks-rsa       → 3.2.2
node_modules/jose           → 4.15.9   (type: commonjs)
```

All apps report `firebase-admin@13.10.0 deduped` and zero stale `14.x` entries remain in the lockfile.

### C. Rebuild and redeploy `customer_app`

```bash
cd customer_app && npm run build
```

The build succeeds and the externalized module now symlinks to the v13 copy (`firebase-admin-a14c8a54…` → `node_modules/firebase-admin`). Then commit the `package.json` + `package-lock.json` changes and redeploy to Vercel.

## Production Behavior

Verified post-fix:

- `require("jose")` works under Node ≥ 18 (jose@4 ships a CommonJS build), so the crash is gone regardless of the Vercel runtime version.
- The only remaining `jose@6.x` in the repo is under `shadcn → @modelcontextprotocol/sdk`, a CLI dev dependency that is never part of the server runtime bundle.

## Prevention / Verification

- **Keep `firebase-admin` on `^13.x`** until `firebase-admin@14`'s `jwks-rsa@4`/`jose@6` chain is fixed upstream (tracked in `firebase/firebase-admin-node#3181`). A clean `jose@6` CJS bridge or `jwks-rsa@5` would also unblock the upgrade.
- **Do not use npm `overrides` to pin `jose`** inside `jwks-rsa`: root overrides are silently dropped when the dependency path crosses a workspace (`file:`) boundary — open npm bug `npm/cli#9659`.
- **On any version change in this monorepo**, if `npm ls` shows `invalid:` entries or stale per-app copies in the lockfile, do a full clean reinstall (remove `node_modules` **and** `package-lock.json`, then `npm install`).
- **Verify after install**: `npm ls firebase-admin jwks-rsa jose` should show one hoisted `firebase-admin@13.10.0` / `jwks-rsa@3.2.2` / `jose@4.15.9` and exit 0 (no `ELSPROBLEMS`).

## File Reference

| File | Role |
|---|---|
| `customer_app/package.json` | `firebase-admin` set to `^13.10.0` (line 17) |
| `driver_app/package.json` | `firebase-admin` set to `^13.10.0` (line 19) |
| `onboarding_app/package.json` | `firebase-admin` set to `^13.10.0` (line 19) |
| `orders_app/package.json` | `firebase-admin` set to `^13.10.0` (line 34) |
| `manager_app/package.json` | stays on `^13.4.0` (unaffected) |
| `package-lock.json` | root lockfile; regenerated clean (single hoisted 13.x tree) |
| `customer_app/src/lib/firebase-admin.ts` | admin init — unchanged (v13-compatible) |
| `customer_app/src/app/actions/placeOrder.ts` | the failing Server Action path (`initAdmin` → `getAuth` → `getFirestore`) |

> References: `https://github.com/firebase/firebase-admin-node/issues/3181` (upstream `ERR_REQUIRE_ESM` bug), `https://github.com/npm/cli/issues/9659` (overrides dropped across workspace link boundary).
