BEGIN;

-- Rename legacy ProviderAvailability table to snake_case.
DO $$
BEGIN
  IF to_regclass('public."ProviderAvailability"') IS NOT NULL
     AND to_regclass('public."provider_availability"') IS NULL THEN
    EXECUTE 'ALTER TABLE "ProviderAvailability" RENAME TO "provider_availability"';
  END IF;
END
$$;

-- Drop legacy foreign keys referencing Provider.
ALTER TABLE IF EXISTS "provider_availability"
  DROP CONSTRAINT IF EXISTS "ProviderAvailability_providerId_fkey",
  DROP CONSTRAINT IF EXISTS "provider_availability_providerId_fkey",
  DROP CONSTRAINT IF EXISTS "provider_availability_provider_id_fkey";

ALTER TABLE IF EXISTS "care_requests"
  DROP CONSTRAINT IF EXISTS "care_requests_providerId_fkey",
  DROP CONSTRAINT IF EXISTS "care_requests_provider_id_fkey",
  DROP CONSTRAINT IF EXISTS "care_requests_careSeekerId_fkey",
  DROP CONSTRAINT IF EXISTS "care_requests_care_seeker_id_fkey";

ALTER TABLE IF EXISTS "provider_verifications"
  DROP CONSTRAINT IF EXISTS "provider_verifications_providerId_fkey",
  DROP CONSTRAINT IF EXISTS "provider_verifications_provider_id_fkey";

-- Rename columns to snake_case.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'provider_availability' AND column_name = 'providerId'
  ) THEN
    EXECUTE 'ALTER TABLE "provider_availability" RENAME COLUMN "providerId" TO "provider_id"';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'provider_availability' AND column_name = 'dayOfWeek'
  ) THEN
    EXECUTE 'ALTER TABLE "provider_availability" RENAME COLUMN "dayOfWeek" TO "day_of_week"';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'provider_availability' AND column_name = 'startTime'
  ) THEN
    EXECUTE 'ALTER TABLE "provider_availability" RENAME COLUMN "startTime" TO "start_time"';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'provider_availability' AND column_name = 'endTime'
  ) THEN
    EXECUTE 'ALTER TABLE "provider_availability" RENAME COLUMN "endTime" TO "end_time"';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'provider_availability' AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "provider_availability" RENAME COLUMN "createdAt" TO "created_at"';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'provider_availability' AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "provider_availability" RENAME COLUMN "updatedAt" TO "updated_at"';
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'care_requests' AND column_name = 'providerId'
  ) THEN
    EXECUTE 'ALTER TABLE "care_requests" RENAME COLUMN "providerId" TO "provider_id"';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'care_requests' AND column_name = 'careSeekerId'
  ) THEN
    EXECUTE 'ALTER TABLE "care_requests" RENAME COLUMN "careSeekerId" TO "care_seeker_id"';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'care_requests' AND column_name = 'scheduledAt'
  ) THEN
    EXECUTE 'ALTER TABLE "care_requests" RENAME COLUMN "scheduledAt" TO "scheduled_at"';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'care_requests' AND column_name = 'deletedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "care_requests" RENAME COLUMN "deletedAt" TO "deleted_at"';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'care_requests' AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "care_requests" RENAME COLUMN "createdAt" TO "created_at"';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'care_requests' AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "care_requests" RENAME COLUMN "updatedAt" TO "updated_at"';
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'provider_verifications' AND column_name = 'providerId'
  ) THEN
    EXECUTE 'ALTER TABLE "provider_verifications" RENAME COLUMN "providerId" TO "provider_id"';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'provider_verifications' AND column_name = 'documentType'
  ) THEN
    EXECUTE 'ALTER TABLE "provider_verifications" RENAME COLUMN "documentType" TO "document_type"';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'provider_verifications' AND column_name = 'documentUrl'
  ) THEN
    EXECUTE 'ALTER TABLE "provider_verifications" RENAME COLUMN "documentUrl" TO "document_url"';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'provider_verifications' AND column_name = 'createdAt'
  ) THEN
    EXECUTE 'ALTER TABLE "provider_verifications" RENAME COLUMN "createdAt" TO "created_at"';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'provider_verifications' AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "provider_verifications" RENAME COLUMN "updatedAt" TO "updated_at"';
  END IF;
END
$$;

-- Drop legacy indexes and recreate with snake_case names.
DROP INDEX IF EXISTS "ProviderAvailability_providerId_idx";
DROP INDEX IF EXISTS "ProviderAvailability_providerId_dayOfWeek_idx";
DROP INDEX IF EXISTS "ProviderAvailability_providerId_date_idx";
DROP INDEX IF EXISTS "provider_availability_providerId_idx";
DROP INDEX IF EXISTS "provider_availability_providerId_dayOfWeek_idx";
DROP INDEX IF EXISTS "provider_availability_providerId_date_idx";
DROP INDEX IF EXISTS "care_requests_providerId_idx";
DROP INDEX IF EXISTS "care_requests_providerId_status_idx";
DROP INDEX IF EXISTS "care_requests_careSeekerId_idx";
DROP INDEX IF EXISTS "provider_verifications_providerId_idx";

CREATE INDEX IF NOT EXISTS "provider_availability_provider_id_idx"
  ON "provider_availability"("provider_id");

CREATE INDEX IF NOT EXISTS "provider_availability_provider_id_day_of_week_idx"
  ON "provider_availability"("provider_id", "day_of_week");

CREATE INDEX IF NOT EXISTS "provider_availability_provider_id_date_idx"
  ON "provider_availability"("provider_id", "date");

CREATE INDEX IF NOT EXISTS "care_requests_provider_id_idx"
  ON "care_requests"("provider_id");

CREATE INDEX IF NOT EXISTS "care_requests_provider_id_status_idx"
  ON "care_requests"("provider_id", "status");

CREATE INDEX IF NOT EXISTS "care_requests_care_seeker_id_idx"
  ON "care_requests"("care_seeker_id");

CREATE INDEX IF NOT EXISTS "provider_verifications_provider_id_idx"
  ON "provider_verifications"("provider_id");

-- Remap legacy provider ids (Provider.id) to User.id using Provider.userId.
UPDATE "provider_availability" pa
SET "provider_id" = p."userId"
FROM "Provider" p
WHERE pa."provider_id" = p."id";

UPDATE "care_requests" cr
SET "provider_id" = p."userId"
FROM "Provider" p
WHERE cr."provider_id" = p."id";

UPDATE "provider_verifications" pv
SET "provider_id" = p."userId"
FROM "Provider" p
WHERE pv."provider_id" = p."id";

-- Remove rows that still reference non-existent users.
DELETE FROM "provider_availability" pa
WHERE NOT EXISTS (
  SELECT 1 FROM "User" u WHERE u."id" = pa."provider_id"
);

DELETE FROM "care_requests" cr
WHERE NOT EXISTS (
  SELECT 1 FROM "User" u WHERE u."id" = cr."provider_id"
)
OR NOT EXISTS (
  SELECT 1 FROM "User" u WHERE u."id" = cr."care_seeker_id"
);

DELETE FROM "provider_verifications" pv
WHERE NOT EXISTS (
  SELECT 1 FROM "User" u WHERE u."id" = pv."provider_id"
);

-- Recreate foreign keys to User(id).
ALTER TABLE "provider_availability"
  ADD CONSTRAINT "provider_availability_provider_id_fkey"
  FOREIGN KEY ("provider_id") REFERENCES "User"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "care_requests"
  ADD CONSTRAINT "care_requests_provider_id_fkey"
  FOREIGN KEY ("provider_id") REFERENCES "User"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "care_requests"
  ADD CONSTRAINT "care_requests_care_seeker_id_fkey"
  FOREIGN KEY ("care_seeker_id") REFERENCES "User"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "provider_verifications"
  ADD CONSTRAINT "provider_verifications_provider_id_fkey"
  FOREIGN KEY ("provider_id") REFERENCES "User"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Remove Provider table and legacy metadata.
DROP INDEX IF EXISTS "Provider_userId_key";
ALTER TABLE IF EXISTS "Provider" DROP CONSTRAINT IF EXISTS "Provider_userId_fkey";
DROP TABLE IF EXISTS "Provider" CASCADE;

COMMIT;
