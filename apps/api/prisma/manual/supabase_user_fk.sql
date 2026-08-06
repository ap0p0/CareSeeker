-- Run this once in Supabase: SQL Editor (against your project).
-- Prisma migrate does not apply this file automatically — the shadow DB has no auth.users.
--
-- Preconditions:
-- 1. `prisma migrate deploy` has applied migrations that make public.users.id a UUID.
-- 2. Every row in public.users has a matching auth.users row (or delete orphans first).

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS "User_auth_users_id_fk";

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS "users_auth_users_id_fk";

ALTER TABLE public.users
  ADD CONSTRAINT "users_auth_users_id_fk"
  FOREIGN KEY ("id")
  REFERENCES auth.users (id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;
