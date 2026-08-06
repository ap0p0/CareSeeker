# CareSeeker Web (`apps/web`)

Single **Vite + React + TypeScript** app that builds **four product variants** from the same codebase. UI uses **MUI**, **TanStack Query**, **React Router**, and **Supabase JS** for auth where needed.

## App variants (`VITE_APP_VARIANT`)

| Variant    | Intended host              | Role                                                         |
| ---------- | -------------------------- | ------------------------------------------------------------ |
| `core`     | careseeker.com (marketing) | Landing, about, basic login/register placeholders            |
| `client`   | client.careseeker.com      | Care seeker portal (dashboard + route placeholders)          |
| `provider` | provider.careseeker.com    | Care provider portal (dashboard + route placeholders)        |
| `admin`    | admin.careseeker.com       | **Internal admin app** — auth + route protection (see below) |

The variant is fixed at **build time** via `VITE_APP_VARIANT`. In development, each `start:*` script sets it for that server instance.

## Admin app (implemented)

Admin is **not** a separate codebase; it is the `admin` variant with dedicated modules under `src/services/admin/` and `src/routes/adminRoutes.tsx`.

- **Login:** `/login` — Supabase `signInWithPassword`, then **`GET /admin/me`** on the API. A valid Supabase session **alone** is not enough; non-admins are **signed out** and see: _“Your account is not authorized to access the admin panel.”_
- **Protection:** `RequireAdmin` route guard + `AdminAuthProvider` (only mounted when variant is `admin`). All admin pages except `/login` wait on a shared loading screen until session + `/admin/me` succeed; otherwise redirect to `/login`. No flash of protected chrome before validation.
- **Logout:** Admin layout includes **Log out** (sidebar on desktop, button above content on mobile) → `signOut` + navigate to `/login`.
- **Reusable module:** `src/services/admin/auth/` — barrel `index.ts` exports `AdminAuthProvider`, `useAdminAuth`, `RequireAdmin`, `fetchAdminMe`, `AdminAuthLoadingScreen`, etc. **`GET /admin/me`** integration lives in `adminMe.ts`.
- **Routes:** `/dashboard` (default), `/careseekers`, `/care-providers`, `/open-jobs`, `/payments-history`, `/reports`; `/` redirects to `/dashboard`; aliases `/jobs` → `/open-jobs`, `/payments` → `/payments-history`.

Client and provider variants do **not** load admin auth — isolation is enforced by `main.tsx` (provider wraps `App` only for `admin`).

## Core / client / provider

- **Routing:** `src/routes/coreRoutes.tsx`, `clientRoutes.tsx`, `providerRoutes.tsx`, `adminRoutes.tsx`; `App.tsx` picks the router from `getAppVariant()` in `src/config/appVariant.ts`.
- **UI:** Feature folders under `src/services/<variant>/` (e.g. `services/core/pages`, `services/admin/…`).

## Environment (`apps/web`)

Vite only exposes variables prefixed with **`VITE_`**. For **Vercel (staging)** and production frontends, configure at least:

| Variable                                | Purpose                                                                                                                                                     |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_PUBLIC_BASE_URL`                  | Public URL of **this** deployment (e.g. `https://admin-careseeker.vercel.app`). Used for auth redirect base / public URL resolution in `env.publicBaseUrl`. |
| `VITE_APP_VARIANT`                      | Which app is built: `core` \| `client` \| `provider` \| `admin`. **Required in production** (see `src/config/appVariant.ts`).                               |
| `VITE_SUPABASE_URL`                     | Supabase project URL (needed wherever Supabase Auth runs, e.g. admin login).                                                                                |
| `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase **anon** / publishable key (browser-safe).                                                                                                         |

Optional (defaults apply if unset):

| Variable                              | Purpose                                                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` or `VITE_API_URL` | Backend API origin. If unset: `http://localhost:2000` on localhost, else `https://backend.careseeker.app`. |

**Admin “back to home”** uses `env.mainPlatformUrl` (hostname-based: local / `*.localhost` → `http://localhost:3000`, otherwise `https://careseeker.app`), not `VITE_PUBLIC_BASE_URL`.

Use `.env` / `.env.local` / Vercel project env (gitignored locally); do not commit secrets.

## Scripts

From `apps/web`:

```bash
pnpm run start:core      # VITE_APP_VARIANT=core, port 3000
pnpm run start:admin     # admin variant, port 3001
pnpm run start:provider  # port 3002
pnpm run start:client    # port 3003
pnpm run start:all       # all four (see concurrently output)
pnpm run build:core      # … build:client, build:provider, build:admin
pnpm run lint
```

From monorepo root: `pnpm start:core`, `pnpm start:admin`, etc., or `pnpm start:all`.

## Dev proxy (optional)

`scripts/dev-proxy.js` — single entry port (e.g. 3000) routing `admin.localhost`, `client.localhost`, etc. to the per-variant Vite ports. Read the script header for the intended port map (may differ slightly from `start:*` default ports).

## Monorepo

See the repository root [`README.md`](../../README.md) for workspace install and cross-package commands.
