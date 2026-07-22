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

CREATE TABLE "Provider" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "bio" TEXT,
  "profileImage" TEXT,
  "status" "ProviderProfileStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProviderAvailability" (
  "id" UUID NOT NULL,
  "providerId" UUID NOT NULL,
  "dayOfWeek" INTEGER,
  "date" DATE,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProviderAvailability_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProviderAvailability_day_or_date_check" CHECK (
    ("dayOfWeek" IS NOT NULL AND "date" IS NULL)
    OR ("dayOfWeek" IS NULL AND "date" IS NOT NULL)
  ),
  CONSTRAINT "ProviderAvailability_day_range_check" CHECK (
    "dayOfWeek" IS NULL OR ("dayOfWeek" >= 0 AND "dayOfWeek" <= 6)
  )
);

CREATE TABLE "care_requests" (
  "id" UUID NOT NULL,
  "providerId" UUID NOT NULL,
  "careSeekerId" UUID NOT NULL,
  "status" "CareRequestStatus" NOT NULL DEFAULT 'PENDING',
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "care_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_verifications" (
  "id" UUID NOT NULL,
  "providerId" UUID NOT NULL,
  "documentType" TEXT NOT NULL,
  "documentUrl" TEXT NOT NULL,
  "status" "ProviderVerificationRecordStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "provider_verifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Provider_userId_key" ON "Provider"("userId");

CREATE INDEX "ProviderAvailability_providerId_idx" ON "ProviderAvailability"("providerId");
CREATE INDEX "ProviderAvailability_providerId_dayOfWeek_idx" ON "ProviderAvailability"("providerId", "dayOfWeek");
CREATE INDEX "ProviderAvailability_providerId_date_idx" ON "ProviderAvailability"("providerId", "date");
CREATE INDEX "care_requests_providerId_idx" ON "care_requests"("providerId");
CREATE INDEX "care_requests_providerId_status_idx" ON "care_requests"("providerId", "status");
CREATE INDEX "care_requests_careSeekerId_idx" ON "care_requests"("careSeekerId");
CREATE INDEX "provider_verifications_providerId_idx" ON "provider_verifications"("providerId");

ALTER TABLE "Provider"
ADD CONSTRAINT "Provider_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProviderAvailability"
ADD CONSTRAINT "ProviderAvailability_providerId_fkey"
FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "care_requests"
ADD CONSTRAINT "care_requests_providerId_fkey"
FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "care_requests"
ADD CONSTRAINT "care_requests_careSeekerId_fkey"
FOREIGN KEY ("careSeekerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "provider_verifications"
ADD CONSTRAINT "provider_verifications_providerId_fkey"
FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
