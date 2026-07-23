# Backend Auth Design

## Overview

- **Supabase** handles authentication (sign-in, tokens, password reset).
- **Backend** provides application user context (role, verification state).
- **Frontend** gets context via `GET /me` with `Authorization: Bearer <token>`.
- **Client registration** may also go through the backend so the auth user and app `User` row are created together.

## Application User Model

The `users` table stores application-level state that Supabase `auth.users` does not:

| Column                       | Type                                          | Description                                    |
| ---------------------------- | --------------------------------------------- | ---------------------------------------------- |
| `id`                         | UUID                                          | Equals Supabase `auth.users.id` (canonical id) |
| `email`                      | string                                        | From Supabase auth                             |
| `name`                       | string                                        | Required                                      |
| `surname`                    | string                                        | Required                                      |
| `role`                       | `seeker` \| `provider` \| `admin`             | Application role                               |
| `providerVerificationStatus` | `pending` \| `approved` \| `rejected` \| null | For providers only                             |

Seeker onboarding / AI-profile fields (age, medical history, care preferences) live in `seekers_info`, linked 1:1 via `seekers_info.userId` → `users.id`.

**Why this table exists:** Supabase `auth.users` only proves identity. Roles, verification, and app state live in our DB and are controlled server-side.

**Link to `auth.users`:** `users.id` is the same UUID as `auth.users.id`. The column is stored as PostgreSQL `uuid` so it can match Supabase’s type. Optionally, add a real foreign key on Supabase (not applied by Prisma’s shadow DB): run [`prisma/manual/supabase_user_fk.sql`](../prisma/manual/supabase_user_fk.sql) in the Supabase SQL Editor after migrations. That enforces `users.id` → `auth.users(id)` with `ON DELETE CASCADE` (deleting the auth user removes the app row).

**Admin is never self-assignable:** New users default to `SEEKER`. Only existing admins (or migrations) can set `role = ADMIN`.

## Client Registration

`POST /seeker/register` creates:

1. A new Supabase auth user
2. A matching `User` row with the same UUID
3. `role = SEEKER`

This endpoint uses `SUPABASE_SECRET_KEY` on the backend (or legacy
`SUPABASE_SERVICE_ROLE_KEY`) so the auth row and the app row stay in sync from
the start, rather than waiting for first login.

## Authentication Guard

`SupabaseJwtGuard`:

1. Reads `Authorization: Bearer <supabase_access_token>`
2. Verifies token: **HS256** with `SUPABASE_JWT_SECRET`, or **asymmetric** (e.g. **ES256**) with `SUPABASE_URL` + JWKS; expects `aud` = `authenticated` for asymmetric tokens
3. Extracts `sub` → Supabase user ID
4. Loads application user from DB (creates with `SEEKER` if new)
5. Attaches `req.user = { id, role, providerVerificationStatus }`

**Why role is resolved server-side:** The JWT does not contain role. Role is stored in our DB and can change. Frontend must call `GET /me` after auth to get context.

## GET /me

**Request:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "id": "uuid",
  "role": "seeker",
  "providerVerificationStatus": null
}
```

**Frontend usage:**

1. User signs in with Supabase Auth (client-side).
2. Store `access_token`.
3. Call `GET /me` with `Authorization: Bearer <access_token>`.
4. Use response for routing, UI, and permission checks.

## Environment

- `DATABASE_URL` — PostgreSQL connection string
- `SUPABASE_JWT_SECRET` — Used when access tokens are signed with **HS256** (legacy “JWT Secret” in Project Settings → API).
- `SUPABASE_URL` — Project URL, e.g. `https://<ref>.supabase.co`. **Required** when Supabase issues **asymmetric** JWTs (JWT signing keys / ES256): verification uses `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`.
- `SUPABASE_SECRET_KEY` — Required for backend-managed signup like `POST /seeker/register`.
- `SUPABASE_SERVICE_ROLE_KEY` — Legacy fallback name supported for compatibility.

The API loads `.env` from **`apps/api/.env`** even when the process `cwd` is the monorepo root (see `src/load-env.ts`). If you still see **401** with a fresh ES256 token, set **`AUTH_DEBUG=true`** on the API and check the server log for the underlying `jose` error (e.g. wrong `SUPABASE_URL` / wrong project vs token `iss`).

**401 vs 403:** If JWT verification fails, the guard returns **401** (token invalid / wrong keys / expired). If verification succeeds but `User.role` is not `admin`, `GET /admin/me` returns **403**. A mismatch between `auth.users.id` and `User.id` does not cause 401: the API would load or create a `User` row for the JWT `sub` and then return **403** if that row is not admin.

**401 vs 500:** After a successful JWT verify, loading the app `User` uses Prisma. If the database errors (migrations not applied, connection failure, schema mismatch), the API returns **500** — not **401**. Earlier, any error in the guard was incorrectly mapped to **401** “Invalid or expired token”; that is fixed so DB failures are visible.

## Linking `auth.users` and `User`

Rows are matched by **id** (`User.id` = `auth.users.id`). If you create an admin in SQL, the **id must be exactly** the UUID from the Auth user. If the JWT `sub` does not match any row, `findOrCreateFromSupabase` **inserts** a new `User` with role **SEEKER**, and admin login will then get **403**, not 401.
