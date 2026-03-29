-- Align User.id with Supabase auth.users.id type (uuid) so a foreign key is possible.
-- Invalid UUID values in "User"."id" will cause this migration to fail.

ALTER TABLE "User" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
