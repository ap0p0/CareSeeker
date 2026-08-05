-- CreateEnum
CREATE TYPE "SpokenLanguage" AS ENUM ('ENGLISH', 'SPANISH', 'CHINESE', 'TAGALOG', 'VIETNAMESE', 'ARABIC', 'FRENCH', 'KOREAN', 'RUSSIAN', 'PORTUGUESE', 'HINDI', 'OTHER');

-- CreateEnum
CREATE TYPE "LivingSituation" AS ENUM ('LIVE_ALONE', 'WITH_SPOUSE_PARTNER', 'WITH_FAMILY', 'WITH_ROOMMATES', 'ASSISTED_LIVING', 'OTHER');

-- CreateEnum
CREATE TYPE "PreferredCaregiverGender" AS ENUM ('FEMALE', 'MALE', 'NO_PREFERENCE');

-- CreateEnum
CREATE TYPE "ScheduleVibe" AS ENUM ('DAYTIME', 'EVENINGS', 'OVERNIGHT', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "HomeAccessibility" AS ENUM ('STAIRS', 'ELEVATOR', 'PARKING');

-- CreateEnum
CREATE TYPE "CareUrgency" AS ENUM ('ASAP', 'WITHIN_A_WEEK', 'EXPLORING');

-- AlterTable
ALTER TABLE "seekers_info"
ADD COLUMN "languagesSpoken" "SpokenLanguage"[] DEFAULT ARRAY[]::"SpokenLanguage"[],
ADD COLUMN "livingSituation" "LivingSituation",
ADD COLUMN "needsHelpBesidesHousehold" BOOLEAN,
ADD COLUMN "preferredCaregiverGender" "PreferredCaregiverGender",
ADD COLUMN "preferredCaregiverLanguage" "SpokenLanguage",
ADD COLUMN "culturalConsiderationsPreference" "DisclosePreference",
ADD COLUMN "culturalConsiderationsNotes" TEXT,
ADD COLUMN "scheduleVibe" "ScheduleVibe",
ADD COLUMN "homeAccessibility" "HomeAccessibility"[] DEFAULT ARRAY[]::"HomeAccessibility"[],
ADD COLUMN "careUrgency" "CareUrgency";

-- CreateIndex
CREATE INDEX "seekers_info_careUrgency_idx" ON "seekers_info"("careUrgency");

-- CreateIndex
CREATE INDEX "seekers_info_scheduleVibe_idx" ON "seekers_info"("scheduleVibe");

-- CreateIndex
CREATE INDEX "seekers_info_preferredCaregiverGender_idx" ON "seekers_info"("preferredCaregiverGender");
