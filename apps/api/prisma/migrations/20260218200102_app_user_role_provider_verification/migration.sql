/*
  Migration: id becomes Supabase auth.users.id (was separate supabaseId).
  Existing rows: id is replaced by supabaseId; providerVerificationStatus added.
  Admin role is never self-assignable; this migration preserves existing roles.
*/
-- CreateEnum
CREATE TYPE "ProviderVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Create new User table with id = Supabase user id
CREATE TABLE "User_new" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SEEKER',
    "providerVerificationStatus" "ProviderVerificationStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_new_pkey" PRIMARY KEY ("id")
);

-- Migrate: use supabaseId as new id
INSERT INTO "User_new" ("id", "email", "role", "providerVerificationStatus", "createdAt", "updatedAt")
SELECT "supabaseId", "email", "role", NULL, "createdAt", "updatedAt"
FROM "User";

-- Replace old table
DROP TABLE "User";
ALTER TABLE "User_new" RENAME TO "User";
