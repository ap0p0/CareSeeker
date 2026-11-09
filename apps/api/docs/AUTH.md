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
| `name`                       | string                                        | Required                                       |
| `surname`                    | string                                        | Required                                       |
| `role`                       | `seeker` \| `provider` \| `admin`             | Application role                               |
| `providerVerificationStatus` | `pending` \| `approved` \| `rejected` \| null | For providers only                             |

Seeker onboarding / AI-profile fields (age, medical history, care preferences) live in `seekers_info`, linked 1:1 via `seekers_info.userId` → `users.id`. When a seeker account is opened on behalf of someone else, the registrant's details (E.164 phone, relationship to the care recipient, consent timestamp) live in `registrants_info` and the care recipient's identity and US address in `care_recipients`, both linked the same way; `seekers_info.careFor` is `OTHER` and `seekers_info` then describes the care recipient's needs. Provider personal information (date of birth, gender, E.164 phone, structured US address, profile-picture storage path) lives in `providers_info`. All of these tables are private: they are only ever returned to the owning user through authenticated `/seeker/*` and `/provider/*` endpoints.

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

## Client Registration on Behalf of Someone Else

`POST /seeker/register/on-behalf` is step 1 of the flow for people who open an
account to find care for a loved one. The **registrant** is the account holder:
the endpoint creates, in order,

1. A new Supabase auth user with the registrant's email / password
2. A `User` row (`role = SEEKER`, the registrant's name and surname) **and**, in
   the same nested write, `seekers_info` (`careFor = OTHER`) and
   `registrants_info` (phone, relationship to the recipient, consent timestamp)

If step 2 fails the auth user is deleted again. The following registration
steps run authenticated with the new session (`role = seeker` required):
`GET`/`PUT /seeker/registrant` (correct step 1),
`GET`/`PUT /seeker/care-recipient` (step 2, the person who needs care) and
`GET`/`PUT /seeker/care-preferences` (step 3, care needs & assistance
preferences) and `GET /seeker/onboarding` + `POST …/complete` / `…/confirm`
(the final review: finished → review page → confirmed → dashboard). All of
them refuse accounts registered for oneself.

## Provider Registration

`POST /provider/register` (multipart) is onboarding step 1 and creates, in order:

1. A new Supabase auth user
2. The profile picture in the private `provider-profile-images` Storage bucket (`<userId>/profile-<uuid>.<ext>`)
3. A `User` row (`role = PROVIDER`, `providerVerificationStatus = PENDING`) **and** its `providers_info` row in a single nested write

If step 2 or 3 fails the uploaded object and the auth user are deleted again, so
a provider can never end up with credentials but no profile. Later onboarding
steps run authenticated (after sign-in) against `/provider/*` endpoints, like the
seeker flow.

Profile pictures are never public: `GET /provider/profile` returns a
short-lived signed URL generated with the service key.

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
- `SUPABASE_SECRET_KEY` — Required for backend-managed signup like `POST /seeker/register` / `POST /provider/register` and for private Storage access.
- `SUPABASE_SERVICE_ROLE_KEY` — Legacy fallback name supported for compatibility.

The API loads `.env` from **`apps/api/.env`** even when the process `cwd` is the monorepo root (see `src/load-env.ts`). If you still see **401** with a fresh ES256 token, set **`AUTH_DEBUG=true`** on the API and check the server log for the underlying `jose` error (e.g. wrong `SUPABASE_URL` / wrong project vs token `iss`).

**401 vs 403:** If JWT verification fails, the guard returns **401** (token invalid / wrong keys / expired). If verification succeeds but `User.role` is not `admin`, `GET /admin/me` returns **403**. A mismatch between `auth.users.id` and `User.id` does not cause 401: the API would load or create a `User` row for the JWT `sub` and then return **403** if that row is not admin.

**401 vs 500:** After a successful JWT verify, loading the app `User` uses Prisma. If the database errors (migrations not applied, connection failure, schema mismatch), the API returns **500** — not **401**. Earlier, any error in the guard was incorrectly mapped to **401** “Invalid or expired token”; that is fixed so DB failures are visible.

## Linking `auth.users` and `User`

Rows are matched by **id** (`User.id` = `auth.users.id`). If you create an admin in SQL, the **id must be exactly** the UUID from the Auth user. If the JWT `sub` does not match any row, `findOrCreateFromSupabase` **inserts** a new `User` with role **SEEKER**, and admin login will then get **403**, not 401.
