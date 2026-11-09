-- Gender is now shared by providers and care recipients. Renaming the type
-- is metadata-only: existing "providers_info"."gender" values are untouched.
ALTER TYPE "ProviderGender" RENAME TO "Gender";

-- CreateEnum
CREATE TYPE "MobilityLevel" AS ENUM (
  'INDEPENDENT',
  'WALKING_AID',
  'NEEDS_ASSISTANCE',
  'WHEELCHAIR',
  'BEDBOUND'
);

-- AlterTable
-- Care-profile answers of the person receiving care (self or recipient).
ALTER TABLE "seekers_info"
ADD COLUMN "mobilityLevel" "MobilityLevel",
ADD COLUMN "otherLanguage" TEXT,
ADD COLUMN "additionalInfo" TEXT;

-- CreateIndex
CREATE INDEX "seekers_info_mobilityLevel_idx" ON "seekers_info"("mobilityLevel");

-- CreateTable
-- Seeker registration on behalf of someone else, step 2: who receives care.
-- Identity and US address only; the care profile goes to "seekers_info".
CREATE TABLE "care_recipients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "care_recipients_userId_key" ON "care_recipients"("userId");

-- CreateIndex
CREATE INDEX "care_recipients_state_postalCode_idx" ON "care_recipients"("state", "postalCode");

-- AddForeignKey
ALTER TABLE "care_recipients"
  ADD CONSTRAINT "care_recipients_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
