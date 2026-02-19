# Backend Auth Design

## Overview

- **Supabase** handles authentication (sign-in, tokens, password reset).
- **Backend** provides application user context (role, verification state).
- **Frontend** gets context via `GET /me` with `Authorization: Bearer <token>`.

## Application User Model

The `User` table stores application-level state that Supabase `auth.users` does not:

| Column                       | Type                                          | Description                                    |
| ---------------------------- | --------------------------------------------- | ---------------------------------------------- |
| `id`                         | UUID                                          | Equals Supabase `auth.users.id` (canonical id) |
| `email`                      | string                                        | From Supabase auth                             |
| `role`                       | `seeker` \| `provider` \| `admin`             | Application role                               |
| `providerVerificationStatus` | `pending` \| `approved` \| `rejected` \| null | For providers only                             |

**Why this table exists:** Supabase `auth.users` only proves identity. Roles, verification, and app state live in our DB and are controlled server-side.

**Admin is never self-assignable:** New users default to `SEEKER`. Only existing admins (or migrations) can set `role = ADMIN`.

## Authentication Guard

`SupabaseJwtGuard`:

1. Reads `Authorization: Bearer <supabase_access_token>`
2. Verifies token using `SUPABASE_JWT_SECRET`
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

- `SUPABASE_JWT_SECRET` — Supabase JWT secret (Project Settings → API)
- `DATABASE_URL` — PostgreSQL connection string
