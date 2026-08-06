-- CreateEnum
CREATE TYPE "CareForType" AS ENUM ('SELF', 'OTHER');

-- CreateEnum
CREATE TYPE "DisclosePreference" AS ENUM ('SHARE', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "EthnicBackground" AS ENUM (
  'CAUCASIAN',
  'AFRICAN_AMERICAN',
  'LATINO',
  'ASIAN',
  'NATIVE_AMERICAN',
  'MIDDLE_EASTERN',
  'MULTIRACIAL_OTHER',
  'PREFER_NOT_TO_SAY'
);

-- CreateTable
CREATE TABLE "seekers_info" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "careFor" "CareForType",
    "helpNeeded" TEXT,
    "location" TEXT,
    "ethnicBackground" "EthnicBackground",
    "needsMedicalHelp" BOOLEAN,
    "healthDisclosePreference" "DisclosePreference",
    "healthNotes" TEXT,
    "medicationsDisclosePreference" "DisclosePreference",
    "medicationsNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seekers_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seekers_info_userId_key" ON "seekers_info"("userId");

-- CreateIndex
CREATE INDEX "seekers_info_careFor_idx" ON "seekers_info"("careFor");

-- CreateIndex
CREATE INDEX "seekers_info_needsMedicalHelp_idx" ON "seekers_info"("needsMedicalHelp");

-- AddForeignKey
ALTER TABLE "seekers_info"
  ADD CONSTRAINT "seekers_info_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
