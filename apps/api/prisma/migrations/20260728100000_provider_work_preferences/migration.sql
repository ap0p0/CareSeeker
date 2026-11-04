-- Provider onboarding step 4: weekly schedule + working preferences.

-- CreateEnum
CREATE TYPE "AvailabilityWindowKind" AS ENUM ('AVAILABLE', 'BLOCKED');
CREATE TYPE "DayAvailabilityMode" AS ENUM ('ALL_DAY', 'AVAILABLE_WINDOWS', 'BLOCKED_WINDOWS');
CREATE TYPE "WorkType" AS ENUM ('FULL_TIME', 'PART_TIME', 'FLEXIBLE');
CREATE TYPE "AvailabilityStart" AS ENUM ('IMMEDIATE', 'SPECIFIC_DATE');
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'SUV', 'MINIVAN', 'VAN', 'TRUCK', 'OTHER');

-- AlterTable: windows can now also describe blocked time.
ALTER TABLE "provider_availability"
  ADD COLUMN "kind" "AvailabilityWindowKind" NOT NULL DEFAULT 'AVAILABLE';
ALTER TABLE "provider_availability"
  ADD CONSTRAINT "provider_availability_time_order_check" CHECK ("start_time" < "end_time");
CREATE INDEX "provider_availability_day_of_week_kind_start_time_end_time_idx"
  ON "provider_availability"("day_of_week", "kind", "start_time", "end_time");

-- CreateTable
CREATE TABLE "provider_working_days" (
    "provider_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "mode" "DayAvailabilityMode" NOT NULL,

    CONSTRAINT "provider_working_days_pkey" PRIMARY KEY ("provider_id", "day_of_week"),
    CONSTRAINT "provider_working_days_day_range_check" CHECK ("day_of_week" >= 0 AND "day_of_week" <= 6)
);
CREATE INDEX "provider_working_days_day_of_week_mode_idx" ON "provider_working_days"("day_of_week", "mode");
ALTER TABLE "provider_working_days"
  ADD CONSTRAINT "provider_working_days_provider_id_fkey"
  FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "provider_work_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "workType" "WorkType" NOT NULL,
    "availabilityStart" "AvailabilityStart" NOT NULL,
    "availableFrom" DATE,
    "acceptsHourly" BOOLEAN NOT NULL,
    "acceptsFixedPrice" BOOLEAN NOT NULL,
    "acceptsOneTimeJobs" BOOLEAN NOT NULL,
    "acceptsDailyJobs" BOOLEAN NOT NULL,
    "acceptsWeeklyJobs" BOOLEAN NOT NULL,
    "acceptsMonthlyJobs" BOOLEAN NOT NULL,
    "availableOvernight" BOOLEAN NOT NULL,
    "availableLiveIn" BOOLEAN NOT NULL,
    "availableEmergency" BOOLEAN NOT NULL,
    "maxTravelDistanceMiles" INTEGER NOT NULL,
    "offersTransportation" BOOLEAN NOT NULL,
    "vehicleType" "VehicleType",
    "vehicleWheelchairAccessible" BOOLEAN,
    "minWeeklyHours" INTEGER NOT NULL,
    "maxWeeklyHours" INTEGER NOT NULL,
    "preferredHourlyRateCents" INTEGER NOT NULL,
    "minHourlyRateCents" INTEGER NOT NULL,
    "matchingNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_work_preferences_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "provider_work_preferences_travel_range_check" CHECK ("maxTravelDistanceMiles" >= 1 AND "maxTravelDistanceMiles" <= 100),
    CONSTRAINT "provider_work_preferences_weekly_hours_check" CHECK ("minWeeklyHours" >= 1 AND "maxWeeklyHours" <= 168 AND "minWeeklyHours" <= "maxWeeklyHours"),
    CONSTRAINT "provider_work_preferences_rates_check" CHECK ("minHourlyRateCents" >= 0 AND "minHourlyRateCents" <= "preferredHourlyRateCents"),
    CONSTRAINT "provider_work_preferences_available_from_check" CHECK ("availabilityStart" <> 'SPECIFIC_DATE' OR "availableFrom" IS NOT NULL)
);
CREATE UNIQUE INDEX "provider_work_preferences_userId_key" ON "provider_work_preferences"("userId");
CREATE INDEX "provider_work_preferences_workType_idx" ON "provider_work_preferences"("workType");
CREATE INDEX "provider_work_preferences_maxTravelDistanceMiles_idx" ON "provider_work_preferences"("maxTravelDistanceMiles");
CREATE INDEX "provider_work_preferences_minHourlyRateCents_idx" ON "provider_work_preferences"("minHourlyRateCents");
ALTER TABLE "provider_work_preferences"
  ADD CONSTRAINT "provider_work_preferences_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
