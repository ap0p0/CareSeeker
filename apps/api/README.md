# CareSeeker API (`apps/api`)

NestJS REST API with **Prisma** (PostgreSQL), **Supabase JWT** verification, and application-level users (roles, provider verification, profile fields).

## What’s implemented

- **Auth:** `SupabaseJwtGuard` validates `Authorization: Bearer <supabase_access_token>` using `SUPABASE_JWT_SECRET` (HS\*) and/or `SUPABASE_URL` (JWKS for asymmetric tokens), then loads the app `User` (creates **seeker** on first sign-in).
- **Users (`users` table / `User` model):** `id` matches Supabase `auth.users.id`; `email`, `name`, `surname`; `role` (`SEEKER` | `PROVIDER` | `ADMIN`); optional `providerVerificationStatus` for providers. Seeker onboarding fields (age, medical, etc.) live in `seekers_info`. Admin role is not self-assignable on create.
- **Endpoints:**
  - `GET /health` — liveness.
  - `GET /me` — current app user (requires valid Bearer token). JSON: `id`, `role`, `providerVerificationStatus`.
  - `GET /admin/me` — same user shape but **403** unless `role === admin`; **source of truth** for admin-app access (see admin frontend).
  - `POST /seeker/register` — creates a Supabase auth user and matching `User` row with role `SEEKER` (`name`, `surname`, `email`, `password`). Age and ethnicity are saved later via `PATCH /seeker/info`.
  - `GET /seeker/me` — same user shape but **403** unless `role === seeker`; source of truth for client-app access.
  - `POST /presignups/seeker` — care seeker presignup (public).
  - `POST /presignups/provider` — care provider presignup (public).
- **CORS:** Configurable via `CORS_ORIGINS`; defaults include local dev ports and `careseeker.app` / `admin.careseeker.app` style hosts.

Further auth design notes: [`docs/AUTH.md`](./docs/AUTH.md).

## Environment (backend only)

Create and edit **`apps/api/.env`** (gitignored). These are the variables **this Nest process actually reads** (via `process.env` / Prisma config):

Quick start:

```bash
# from apps/api
cp .env.example .env
# then edit .env and set DATABASE_URL at minimum
```

| Variable                    | Required                    | Description                                                                                                        |
| --------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`              | Yes                         | PostgreSQL URL for Prisma.                                                                                         |
| `SUPABASE_JWT_SECRET`       | Yes\*                       | Verifies **HS256** access tokens (legacy “JWT Secret” under API settings). **Not** the anon/publishable key.       |
| `SUPABASE_URL`              | Yes\*                       | `https://<project-ref>.supabase.co` — required to verify **asymmetric** JWTs (JWKS). Use the same project as Auth. |
| `SUPABASE_SECRET_KEY`       | For `POST /seeker/register` | Supabase secret key (`sb_secret_...`) used by the API to create auth users.                                        |
| `SUPABASE_SERVICE_ROLE_KEY` | Legacy fallback             | Older service-role key name still accepted by the backend for compatibility.                                       |
| `PORT`                      | No                          | HTTP port (default **2000**).                                                                                      |
| `CORS_ORIGINS`              | No                          | Comma-separated extra allowed origins.                                                                             |

\*For JWT: set **both** during Supabase migration, or whichever matches your token algorithm (**HS256** → `SUPABASE_JWT_SECRET`; **ES256** / signing keys → `SUPABASE_URL`).

Often present in production configs but **not read by this codebase** (safe to set for your host / Docker image):

| Variable       | Notes                                                                        |
| -------------- | ---------------------------------------------------------------------------- |
| `NODE_VERSION` | Common on Vercel, Railway, Docker, CI to select Node; Nest does not read it. |

**About `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`:** those names are for **browser / Next.js-style frontends**. The **API does not use them**. The server needs **`SUPABASE_URL`** and/or **`SUPABASE_JWT_SECRET`** for JWT validation (see table above). If you only copy frontend anon keys, add these separately for `apps/api`.

The Vite web app uses **`VITE_`-prefixed** Supabase vars — see [`apps/web/README.md`](../web/README.md).

## Setup

From repo root:

```bash
pnpm install
```

From `apps/api`:

```bash
# Ensure .env is filled (DATABASE_URL, SUPABASE_JWT_SECRET)
pnpm exec prisma generate
pnpm exec prisma migrate deploy   # or: prisma migrate dev
```

Optional on **Supabase**: after migrations, run `prisma/manual/supabase_user_fk.sql` in the SQL Editor to add `FOREIGN KEY (users.id) REFERENCES auth.users(id)` (see [`docs/AUTH.md`](./docs/AUTH.md)).

## Run

```bash
# from apps/api
pnpm start:dev      # watch mode
pnpm build && pnpm start:prod
```

If you see `Error: DATABASE_URL is not set`, verify:

1. `apps/api/.env` exists.
2. `DATABASE_URL` is present in `apps/api/.env`.
3. You started the API from `apps/api` (or with workspace script that still loads `apps/api/.env`).

From monorepo root:

```bash
pnpm start:api
```

## Project layout

- `src/app.controller.ts` — `GET /health`, `GET /me`
- `src/admin/admin.controller.ts` — `GET /admin/me`
- `src/auth/` — JWT guard, types
- `src/users/` — `findOrCreateFromSupabase`, user persistence
- `src/presignups/` — presignup API
- `src/prisma/` — Prisma service
- `prisma/schema.prisma` — data model and migrations under `prisma/migrations/`

## Scripts (package.json)

| Script          | Purpose                         |
| --------------- | ------------------------------- |
| `start:dev`     | Nest watch                      |
| `build`         | `prisma generate` + Nest build  |
| `start:prod`    | Run compiled `dist/src/main.js` |
| `lint` / `test` | ESLint / Jest                   |
