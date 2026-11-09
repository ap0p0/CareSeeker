-- CreateEnum
-- Mirrors the job frequencies providers accept ("accepts*Jobs").
CREATE TYPE "CareFrequency" AS ENUM ('ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "CareDuration" AS ENUM ('SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM', 'NOT_SURE');

-- CreateTable
-- Seeker registration on behalf of someone else, step 3: care needs and
-- assistance preferences. Uses the provider vocabulary (services, tasks,
-- qualifications) so seekers and providers can be matched directly.
CREATE TABLE "care_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "careServices" "CareServiceCategory"[],
    "otherCareService" TEXT,
    "careTasks" "CareTask"[],
    "careFrequency" "CareFrequency" NOT NULL,
    "hoursPerWeek" INTEGER,
    "careDuration" "CareDuration" NOT NULL,
    "scheduleFlexible" BOOLEAN NOT NULL,
    "needsOvernightCare" BOOLEAN NOT NULL,
    "needsLiveInCare" BOOLEAN NOT NULL,
    "needsEmergencyCover" BOOLEAN NOT NULL,
    "requiresCaregiverVehicle" BOOLEAN NOT NULL,
    "requiresWheelchairAccessibleVehicle" BOOLEAN NOT NULL,
    "petsInHome" BOOLEAN NOT NULL,
    "specialRequirements" TEXT,
    "requiredQualifications" "ProfessionalQualification"[],
    "minYearsExperience" INTEGER,
    "maxHourlyRateCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Weekdays care is needed on (ALL_DAY or AVAILABLE_WINDOWS).
CREATE TABLE "care_schedule_days" (
    "userId" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "mode" "DayAvailabilityMode" NOT NULL,

    CONSTRAINT "care_schedule_days_pkey" PRIMARY KEY ("userId", "dayOfWeek")
);

-- CreateTable
-- Hours care is needed on a weekday ("HH:mm"; overnight via "endsNextDay").
CREATE TABLE "care_schedule_windows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "endsNextDay" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "care_schedule_windows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "care_preferences_userId_key" ON "care_preferences"("userId");

-- CreateIndex
CREATE INDEX "care_preferences_careServices_idx" ON "care_preferences" USING GIN ("careServices");

-- CreateIndex
CREATE INDEX "care_preferences_careTasks_idx" ON "care_preferences" USING GIN ("careTasks");

-- CreateIndex
CREATE INDEX "care_preferences_careFrequency_idx" ON "care_preferences"("careFrequency");

-- CreateIndex
CREATE INDEX "care_preferences_maxHourlyRateCents_idx" ON "care_preferences"("maxHourlyRateCents");

-- CreateIndex
CREATE INDEX "care_schedule_days_dayOfWeek_mode_idx" ON "care_schedule_days"("dayOfWeek", "mode");

-- CreateIndex
CREATE INDEX "care_schedule_windows_userId_idx" ON "care_schedule_windows"("userId");

-- CreateIndex
CREATE INDEX "care_schedule_windows_dayOfWeek_startTime_endTime_idx" ON "care_schedule_windows"("dayOfWeek", "startTime", "endTime");

-- AddForeignKey
ALTER TABLE "care_preferences"
  ADD CONSTRAINT "care_preferences_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_schedule_days"
  ADD CONSTRAINT "care_schedule_days_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_schedule_windows"
  ADD CONSTRAINT "care_schedule_windows_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
