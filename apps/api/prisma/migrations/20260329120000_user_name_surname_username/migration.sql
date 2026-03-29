-- Add profile fields; backfill existing rows before NOT NULL + unique constraints.

ALTER TABLE "User" ADD COLUMN "name" TEXT;
ALTER TABLE "User" ADD COLUMN "surname" TEXT;
ALTER TABLE "User" ADD COLUMN "username" TEXT;

UPDATE "User"
SET
  "name" = 'Unknown',
  "surname" = 'User',
  "username" = 'u_' || REPLACE("id", '-', '')
WHERE
  "name" IS NULL;

ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "surname" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

CREATE UNIQUE INDEX "User_username_key" ON "User" ("username");
