# CareSeeker API (`apps/api`)

NestJS REST API with **Prisma** (PostgreSQL), **Supabase JWT** verification, and application-level users (roles, provider verification, profile fields).

## What’s implemented

- **Auth:** `SupabaseJwtGuard` validates `Authorization: Bearer <supabase_access_token>` using `SUPABASE_JWT_SECRET` (HS\*) and/or `SUPABASE_URL` (JWKS for asymmetric tokens), then loads the app `User` (creates **seeker** on first sign-in).
- **Users (`users` table / `User` model):** `id` matches Supabase `auth.users.id`; `email`, `name`, `surname`; `role` (`SEEKER` | `PROVIDER` | `ADMIN`); optional `providerVerificationStatus` for providers. Seeker onboarding fields (age, medical, etc.) live in `seekers_info`; when a seeker account is opened on behalf of someone else, the registrant's details (phone, relationship to the care recipient, consent timestamp) live in `registrants_info`, the care recipient's identity and address in `care_recipients`, `seekers_info.careFor` is `OTHER` and `seekers_info` holds the recipient's care profile; provider personal information (date of birth, gender, phone, US address, profile picture path) lives in `providers_info` (1:1 via `userId`). The API refuses to start when the database is unreachable (clear `Cannot connect to the database…` error instead of 500s on first use). Admin role is not self-assignable on create.
- **Endpoints:**
  - `GET /health` — liveness.
  - `GET /me` — current app user (requires valid Bearer token). JSON: `id`, `role`, `providerVerificationStatus`.
  - `GET /admin/me` — same user shape but **403** unless `role === admin`; **source of truth** for admin-app access (see admin frontend).
  - `POST /seeker/register` — creates a Supabase auth user and matching `User` row with role `SEEKER` (`name`, `surname`, `email`, `password`). Age and ethnicity are saved later via `PATCH /seeker/info`.
  - `POST /seeker/register/on-behalf` — registration **on behalf of someone else** (a care seeker account opened by a relative, friend or guardian), **step 1: the registrant**. JSON: `name`, `surname`, `email`, `password` (+ optional `confirmPassword`), `phone` (US number, stored as E.164 `+1XXXXXXXXXX`), `relationship` (`parent` | `child` | `spouse_partner` | `sibling` | `grandparent` | `grandchild` | `other_relative` | `friend_neighbor` | `legal_guardian` | `other`, read from the registrant's side — `child` = "I am their child"), `relationshipOther` (required for `other`, cleared otherwise) and `consentToActOnBehalf: true` (the registrant confirms they may arrange care for the recipient; stored as `consentConfirmedAt`). Creates the auth user, then `users` (role `SEEKER`, the registrant is the account holder), `seekers_info` (`careFor = OTHER`) and `registrants_info` in one nested write; a failed write removes the auth user again. Validation errors return `400 { code: "VALIDATION_ERROR", errors: [...] }`, duplicate emails `409`. Response `data`: `{ id, email, name, surname, role, careFor: "other", registrant: { phone, relationship, relationshipOther, consentConfirmedAt } }`. The following steps run with the new session.
  - `GET /seeker/registrant` / `PUT /seeker/registrant` — read / correct the registrant of an on-behalf account after registration (going back to step 1). `PUT` fully replaces `name`, `surname`, `phone`, `relationship`, `relationshipOther` with the registration rules; email / password are account settings and consent is not asked again. `404 REGISTRANT_NOT_FOUND` for accounts registered for oneself (the client app uses this to tell both kinds apart).
  - `GET /seeker/care-recipient` / `PUT /seeker/care-recipient` — on-behalf **step 2: the person who needs care**, fully replaced on each `PUT` (safe to re-save when navigating back and forth). JSON: `name`, `surname`, `dateOfBirth` (`YYYY-MM-DD`, no minimum age, not in the future, ≤ 120 years), `gender` (required: `female` | `male` | `non_binary` | `prefer_not_to_say`), US address (`addressLine1`, `city`, `state` USPS code, `postalCode` ZIP / ZIP+4), `livingSituation`, `mobilityLevel` (`independent` | `walking_aid` | `needs_assistance` | `wheelchair` | `bedbound`), `languagesSpoken[]` (≥ 1, + `otherLanguage` when `other`), `ethnicBackground`, optional `additionalInfo` (≤ 2000; about the person — care instructions belong to step 3). What help is needed is asked once, in step 3. Unknown options are rejected. Identity + address are stored in `care_recipients`; the care profile in `seekers_info` (the same columns the self flow uses, so matching reads one table for both kinds of account), both in one transaction. Response: `{ completed, careRecipient }`. `409 NOT_ON_BEHALF_ACCOUNT` for accounts registered for oneself.
  - `GET /seeker/care-preferences` / `PUT /seeker/care-preferences` — on-behalf **step 3: care needs & assistance preferences**, fully replaced on each `PUT`. The shape depends on `careFrequency` (`one_time` | `daily` | `weekly` | `monthly`):
    - always: `careTasks[]` (≥ 1, provider `CareTask` vocabulary — the only "what help is needed" question of the flow), `scheduleFlexible`, `petsInHome`, `requiresWheelchairAccessibleVehicle` (only used with the driving task), optional `homeAccessibility[]`, `specialRequirements` (≤ 1000), `budget: { paymentType: hourly | fixed_price, amountCents }` (≤ $500/hour or ≤ $10,000 fixed), `caregiverPreferences: { gender (required), language?, requiredQualifications?[], minYearsExperience?, culturalConsiderations? }`;
    - `one_time`: `visit: { date (YYYY-MM-DD, today … +365 days), startTime, endTime (HH:mm, same day), notes? (≤ 500) }` and a **required** `budget.amountCents`; recurring answers are ignored;
    - recurring: `recurring: { hoursPerWeek (1–168), careDuration, careUrgency, scheduleDays[] (same shape/rules as provider `workingDays`, only `all_day`/`available_windows`), needsLiveInCare, needsEmergencyCover }`; budget amount optional.
      Derived server-side so the form never asks twice: `requiresCaregiverVehicle` ← `transportation_driving` task, `needsOvernightCare` ← `overnight_care` task or a window ending the next day, `petsInHome` ← also true with `pet_care`. Typed criteria go to `care_preferences` (task / qualification arrays GIN-indexed for overlap matching), the schedule to `care_schedule_days` / `care_schedule_windows`, and urgency, caregiver gender / language, home accessibility and cultural considerations to `seekers_info` — one transaction. The response uses the same grouping: `{ completed, preferences: { careFrequency, careTasks, visit, recurring, …, budget, caregiverPreferences } }`. `409 NOT_ON_BEHALF_ACCOUNT` for accounts registered for oneself.
  - `GET /seeker/onboarding` → `{ careFor, registrant, careRecipient, carePreferences, completedAt, profileConfirmedAt }` — registration status **plus everything saved so far** (one request for the review page and the route guard); `careFor: "self"` accounts return nulls and have no gate. `POST /seeker/onboarding/complete` marks the on-behalf flow finished (409 `ONBOARDING_INCOMPLETE` until steps 2 and 3 are saved; idempotent); `POST /seeker/onboarding/confirm` records that the seeker reviewed the summary and confirmed it (requires completion; idempotent). Both answer 409 `NOT_ON_BEHALF_ACCOUNT` for self-registered accounts. Stored as `seekers_info.onboardingCompletedAt` / `profileConfirmedAt` (same meaning as on `providers_info`): until confirmed, the client app only shows the review page.
  - `POST /provider/register` — provider onboarding **step 1** (`multipart/form-data`): `name`, `surname`, `dateOfBirth` (`YYYY-MM-DD`, 18+), optional `gender` (`Gender` enum, shared with care recipients: `female` | `male` | `non_binary` | `prefer_not_to_say`), `email`, `password` (+ optional `confirmPassword`), `phone` (US number, stored as E.164 `+1XXXXXXXXXX`), `addressLine1`, `city`, `state` (USPS code, US-only platform), `postalCode` (ZIP or ZIP+4), and a `profilePicture` file (JPEG/PNG/WebP, ≤ 5 MB). Creates the auth user, uploads the picture to a **private** Supabase Storage bucket, then writes `users` + `providers_info` in one transaction; any failure rolls back the auth user and the upload. Validation errors return `400 { code: "VALIDATION_ERROR", errors: [...] }`; duplicate emails `409 DUPLICATE_EMAIL`.
  - `GET /provider/me` — **403** unless `role === provider`; source of truth for provider-app access.
  - `GET /provider/profile` / `PATCH /provider/profile` — read / partially update the provider's identity + personal information (same validation rules as registration; address parts must be sent together). The picture is returned as a short-lived signed `profileImageUrl`.
  - `PUT /provider/profile/picture` — replace the profile picture (`multipart/form-data`, field `profilePicture`).
  - `GET /provider/documents`, `POST /provider/documents` (`multipart/form-data`: `category` + up to 10 `files`), `GET /provider/documents/:id/download[?disposition=inline]`, `PUT /provider/documents/:id` (`file` + optional `category`, keeps the id), `DELETE /provider/documents/:id` (soft delete) — onboarding **step 3**. Categories: `cv_resume`, `reference_letter`, `educational_certificate`, `professional_certificate`, `medical_license_permit`, `other`. PDF / DOC / DOCX / JPG / PNG up to 15 MB, validated by extension, declared type **and structural content checks** (`document-content.ts`: PDF header + `%%EOF` trailer, OLE2 header fields for `.doc`, ZIP central directory with the mandatory OOXML parts for `.docx`, PNG `IHDR`, JPEG SOI); up to 30 active documents per provider. Files are read/written only through the `FileStorage` abstraction and streamed back through the API (never a public URL); metadata lives in `provider_documents` (`storage_key`, `storage_provider`, size, type, soft-delete). `GET /admin/providers/:providerId/documents[/:id/download]` gives admins the same read path.
  - `GET /provider/work-preferences` / `PUT /provider/work-preferences` — onboarding **step 4** (availability & work preferences), fully replaced on each `PUT` and reusable for profile editing. JSON: `workingDays[]` (`dayOfWeek` 0 = Sunday … 6, `mode` = `all_day` | `available_windows` | `blocked_windows`, `windows[{start,end,endsNextDay}]` as `HH:mm`, sorted / non-overlapping; `endsNextDay: true` marks an overnight window such as 22:00 → 06:00, which covers `[start, 24:00)` on its day and `[00:00, end)` on the next — so a query for day D must also consider D-1 rows with `ends_next_day`), `workType`, `availabilityStart` (+ `availableFrom` `YYYY-MM-DD`), `acceptsHourly` / `acceptsFixedPrice`, `acceptsOneTimeJobs` / `acceptsDailyJobs` / `acceptsWeeklyJobs` / `acceptsMonthlyJobs`, `availableOvernight` / `availableLiveIn` / `availableEmergency`, `maxTravelDistanceMiles` (1–100), `offersTransportation` (+ `vehicleType`, `vehicleWheelchairAccessible`), `minWeeklyHours` / `maxWeeklyHours`, `preferredHourlyRateCents` / `minHourlyRateCents`, `matchingNotes`. Stored as `provider_work_preferences` (one typed column per criterion, indexed for filtering), `provider_working_days` (one row per weekday with its mode) and weekly rows in the existing `provider_availability` table (now with `kind` AVAILABLE | BLOCKED and `ends_next_day`); date-specific rows from `/provider/availability` are left untouched. Response: `{ completed, preferences }`.
  - `GET /provider/onboarding` → `{ personalInfo, serviceProfile, documentsCount, workPreferences, completedAt, profileConfirmedAt }`; `POST /provider/onboarding/complete` marks the flow finished (409 `ONBOARDING_INCOMPLETE` until steps 1, 2 and 4 are saved; idempotent); `POST /provider/onboarding/confirm` records that the provider reviewed the one-time overview (requires completion; idempotent) — until it is set the provider app only shows the review page, afterwards the dashboard.
  - `GET /provider/overview` — read-only aggregate for the provider's overview page / dashboard widgets: `{ profile, serviceProfile, workPreferences, documents, onboarding, completion }` where `completion` is a weighted checklist (`percentage` + per-section `complete` flags: personal info 20, picture 10, services 25, availability 25, CV 10, other documents 10). Editing always goes through the per-section endpoints above. The provider app uses it to resume `/register` at the first unfinished step after a refresh and to redirect completed providers to the dashboard.
  - `GET /provider/service-profile` / `PUT /provider/service-profile` — onboarding **step 2** (services & job interests), saved independently of step 1 and fully replaced on each `PUT`. JSON: `careServices[]` (+ `otherCareService`), `skills[]` (+ `otherSkill`), `yearsOfExperience` (0–60), `previousCareExperience`, `qualifications[]` (+ `otherQualification`), `languages[]` (+ `otherLanguage`, shares `SpokenLanguage` with seekers), `coverLetter` (20–1000 chars), `jobCategories[]`, `tasksWilling[]`, `tasksUnwilling[]` (no overlap), `clientGroups[]`. Values are lower-cased enum names; unknown options are rejected. Response: `{ completed, profile }`. Each multi-select is stored relationally (`provider_care_services`, `provider_skills`, `provider_qualifications`, `provider_languages`, `provider_job_categories`, `provider_task_preferences`, `provider_client_groups` — one row per selection, indexed for filtering / matching) with the scalar answers in `provider_service_profiles`.
  - `GET /seeker/me` — same user shape but **403** unless `role === seeker`; source of truth for client-app access.
  - `POST /presignups/seeker` — care seeker presignup (public).
  - `POST /presignups/provider` — care provider presignup (public).
- **CORS:** Configurable via `CORS_ORIGINS`; defaults include local dev ports and `careseeker.app` / `admin.careseeker.app` style hosts.

Further auth design notes: [`docs/AUTH.md`](./docs/AUTH.md).

## Applying migrations

After pulling changes that add a migration (new folder under `prisma/migrations/`), apply it before starting the API:

```bash
# from apps/api
pnpm db:migrate          # = prisma migrate deploy
```

The API checks `prisma/migrations` against the database's `_prisma_migrations` history at boot and **refuses to start** while migrations are pending, naming them and the command to run — a stale schema would otherwise surface as confusing `500`s (`column … does not exist`). Set `SKIP_MIGRATION_CHECK=true` only for databases managed outside Prisma.

## Offline / closed-environment mode (`AUTH_MODE=local`)

Until the Supabase project is configured, the whole stack can run without network access:

```bash
# apps/api/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/careseeker
DATABASE_SSL=false          # local Postgres without TLS
AUTH_MODE=local
```

File storage is selected separately by `STORAGE_PROVIDER` (`local` | `supabase`, defaults to follow `AUTH_MODE`). Both adapters implement the same `FileStorage` interface (`src/storage/file-storage.ts`: upload, replace, download, remove, metadata, signed URL) and use the same `<bucket>/<providerId>/<uuid>.<ext>` layout, so switching providers changes no business logic, endpoint, frontend code or database column. `local` keeps files under `UPLOADS_DIR` (default `apps/api/uploads`, gitignored, never served statically — reads go through authenticated endpoints or HMAC-signed URLs); `supabase` uses private buckets (`provider-documents`, `provider-profile-images`) through the service key on the backend only, **fails at boot** if `SUPABASE_URL` / `SUPABASE_SECRET_KEY` are missing instead of falling back, and refuses to write into an existing bucket unless it is verifiably private (a public or unreadable bucket is a `503 DOCUMENT_STORAGE_UNAVAILABLE`, never a silent upload).

What changes with `AUTH_MODE=local`:

- Credentials are stored in `apps/api/.local/auth-users.json` (scrypt hashes, gitignored) instead of Supabase Auth; `POST /seeker/register`, `POST /provider/register` and account-settings updates use that store.
- `POST /local-auth/sign-in` (`{ email, password }`) issues an HS256 access token (`LOCAL_AUTH_JWT_SECRET`, dev default when unset). `SupabaseJwtGuard` verifies those tokens, so every `/me`, `/provider/*`, `/seeker/*`, `/admin/*` endpoint works unchanged.
- With the default `STORAGE_PROVIDER=local`, uploads (profile pictures, documents) are written to `apps/api/uploads/<bucket>/…`; profile pictures are served through signed, expiring URLs at `GET /local-storage/file`, documents only through the authenticated download endpoints.
- The web apps switch to the matching local auth client automatically when `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` are unset (or explicitly with `VITE_AUTH_MODE=local`).

Create accounts by registering through the client / provider apps, or seed any role (e.g. an admin) with:

```bash
# from apps/api (builds first, reads apps/api/.env)
pnpm local-auth:create-user -- --email admin@local.test --password secret123 --role admin
```

Switching back to Supabase is configuration only: set `AUTH_MODE=supabase` (or remove it) and the `SUPABASE_*` variables. Local-mode accounts do not carry over.

## Environment (backend only)

Create and edit **`apps/api/.env`** (gitignored). These are the variables **this Nest process actually reads** (via `process.env` / Prisma config):

Quick start:

```bash
# from apps/api
cp .env.example .env
# then edit .env and set DATABASE_URL at minimum
```

| Variable                                                                         | Required                                                  | Description                                                                                                                                                    |
| -------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                   | Yes                                                       | PostgreSQL URL for Prisma.                                                                                                                                     |
| `DATABASE_SSL`                                                                   | No                                                        | `false` to connect without TLS (local Postgres). Default `true`; `?sslmode=disable` in the URL also works.                                                     |
| `SKIP_MIGRATION_CHECK`                                                           | No                                                        | `true` disables the boot-time pending-migration check (databases not managed with Prisma Migrate).                                                             |
| `AUTH_MODE`                                                                      | No                                                        | `supabase` (default) or `local` — see “Offline / closed-environment mode”. With `local`, no `SUPABASE_*` variable is needed.                                   |
| `LOCAL_AUTH_JWT_SECRET` / `LOCAL_AUTH_DIR` / `API_PUBLIC_URL`                    | No                                                        | Local-mode only: token secret, data directory (default `apps/api/.local`), public API origin for file URLs (default `http://localhost:PORT`).                  |
| `SUPABASE_JWT_SECRET`                                                            | Yes\*                                                     | Verifies **HS256** access tokens (legacy “JWT Secret” under API settings). **Not** the anon/publishable key.                                                   |
| `SUPABASE_URL`                                                                   | Yes\*                                                     | `https://<project-ref>.supabase.co` — required to verify **asymmetric** JWTs (JWKS). Use the same project as Auth.                                             |
| `SUPABASE_SECRET_KEY`                                                            | For `POST /seeker/register` and `POST /provider/register` | Supabase secret key (`sb_secret_...`) used by the API to create auth users and to access private Storage buckets.                                              |
| `SUPABASE_SERVICE_ROLE_KEY`                                                      | Legacy fallback                                           | Older service-role key name still accepted by the backend for compatibility.                                                                                   |
| `STORAGE_PROVIDER` / `UPLOADS_DIR`                                               | No                                                        | `local` (files under `UPLOADS_DIR`, default `apps/api/uploads`) or `supabase` (private buckets; config required, no fallback). Defaults to follow `AUTH_MODE`. |
| `SUPABASE_PROVIDER_PROFILE_IMAGES_BUCKET` / `SUPABASE_PROVIDER_DOCUMENTS_BUCKET` | No                                                        | Private bucket names (defaults `provider-profile-images`, `provider-documents`). Created automatically on first upload if missing.                             |
| `PORT`                                                                           | No                                                        | HTTP port (default **2000**).                                                                                                                                  |
| `CORS_ORIGINS`                                                                   | No                                                        | Comma-separated extra allowed origins.                                                                                                                         |

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
- `src/auth/` — JWT guard, types, `AuthUserProvider` adapters (`supabase-auth-user-provider.ts`, `local/`)
- `src/storage/` — `FileStorage` interface, adapters (`supabase-file-storage.ts`, `local-file-storage.ts`), provider selection (`storage-config.ts`) + bucket policies
- `src/provider/work-preferences/` — availability & work preferences (onboarding step 4); `src/provider/availability/` — per-window CRUD on the same schedule table
- `src/provider/overview/` — aggregate read + profile-completion calculation; `src/provider/onboarding/` — onboarding status / complete / confirm
- `src/provider/documents/` — provider documents (onboarding step 3): validation / content sniffing, service keeping storage and `provider_documents` consistent, provider + admin controllers
- `src/users/` — `findOrCreateFromSupabase`, user persistence
- `src/seeker/` — seeker registration (`seeker.service.ts`: self-registration and registration on behalf of someone else), `/seeker/*` endpoints and per-feature sub-modules: `registrant/` (on-behalf step 1 rules + `GET`/`PUT /seeker/registrant`), `care-recipient/` (on-behalf step 2), `care-preferences/` (on-behalf step 3), `onboarding/` (status / complete / confirm for the final review), `jobs/`, `messages/`, …
- `src/common/` — validation shared across domains: `personal-info.validation.ts` (names, dates of birth with per-flow age rules, `Gender`, US addresses), `field-parsers.ts` (multi-selects, enums, booleans, integers, free text, "Other (specify)"), `weekly-schedule.validation.ts` (weekly days + time windows incl. overnight, used by provider availability and seeker care schedules), `us-phone.ts`, `us-states.ts`
- `src/provider/` — provider registration (`provider.service.ts`), `common/` (shared personal-info validation, profile-picture storage, upload helpers) and per-feature sub-modules (`profile/`, `service-profile/` = onboarding step 2, `availability/`, …)
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
