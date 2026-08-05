BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProviderProfileStatus') THEN
    CREATE TYPE "ProviderProfileStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'PENDING_VERIFICATION');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CareRequestStatus') THEN
    CREATE TYPE "CareRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProviderVerificationRecordStatus') THEN
    CREATE TYPE "ProviderVerificationRecordStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END
$$;

-- Remove legacy constraints/indexes that reference Provider and old camelCase names.
ALTER TABLE IF EXISTS "provider_availability"
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

DROP INDEX IF EXISTS "Provider_userId_key";
DROP INDEX IF EXISTS "provider_availability_providerId_idx";
DROP INDEX IF EXISTS "provider_availability_providerId_dayOfWeek_idx";
DROP INDEX IF EXISTS "provider_availability_providerId_date_idx";
DROP INDEX IF EXISTS "care_requests_providerId_idx";
DROP INDEX IF EXISTS "care_requests_providerId_status_idx";
DROP INDEX IF EXISTS "care_requests_careSeekerId_idx";
DROP INDEX IF EXISTS "provider_verifications_providerId_idx";

-- Provider table must not exist in final schema.
DROP TABLE IF EXISTS "Provider" CASCADE;

-- Recreate tables with normalized snake_case schema.
DROP TABLE IF EXISTS "provider_availability" CASCADE;
CREATE TABLE "provider_availability" (
  "id" UUID NOT NULL,
  "provider_id" UUID NOT NULL,
  "day_of_week" INTEGER,
  "date" DATE,
  "start_time" TEXT NOT NULL,
  "end_time" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "provider_availability_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "provider_availability_day_or_date_check" CHECK (
    ("day_of_week" IS NOT NULL AND "date" IS NULL)
    OR ("day_of_week" IS NULL AND "date" IS NOT NULL)
  ),
  CONSTRAINT "provider_availability_day_range_check" CHECK (
    "day_of_week" IS NULL OR ("day_of_week" >= 0 AND "day_of_week" <= 6)
  )
);

DROP TABLE IF EXISTS "care_requests" CASCADE;
CREATE TABLE "care_requests" (
  "id" UUID NOT NULL,
  "provider_id" UUID NOT NULL,
  "care_seeker_id" UUID NOT NULL,
  "status" "CareRequestStatus" NOT NULL DEFAULT 'PENDING',
  "scheduled_at" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "care_requests_pkey" PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "provider_verifications" CASCADE;
CREATE TABLE "provider_verifications" (
  "id" UUID NOT NULL,
  "provider_id" UUID NOT NULL,
  "document_type" TEXT NOT NULL,
  "document_url" TEXT NOT NULL,
  "status" "ProviderVerificationRecordStatus" NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "provider_verifications_pkey" PRIMARY KEY ("id")
);

-- Recreate indexes in snake_case.
CREATE INDEX "provider_availability_provider_id_idx"
  ON "provider_availability"("provider_id");

CREATE INDEX "provider_availability_provider_id_day_of_week_idx"
  ON "provider_availability"("provider_id", "day_of_week");

CREATE INDEX "provider_availability_provider_id_date_idx"
  ON "provider_availability"("provider_id", "date");

CREATE INDEX "care_requests_provider_id_idx"
  ON "care_requests"("provider_id");

CREATE INDEX "care_requests_provider_id_status_idx"
  ON "care_requests"("provider_id", "status");

CREATE INDEX "care_requests_care_seeker_id_idx"
  ON "care_requests"("care_seeker_id");

CREATE INDEX "provider_verifications_provider_id_idx"
  ON "provider_verifications"("provider_id");

-- Foreign keys now reference User(id) only.
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

COMMIT;
