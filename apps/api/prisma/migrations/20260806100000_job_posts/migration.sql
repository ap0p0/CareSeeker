-- Job posts: a seeker's job is prefilled from their profile (care recipient
-- + care preferences) and stored as a snapshot with the same vocabulary as
-- "care_preferences", so jobs and providers can be matched directly.
-- Existing rows keep working: every new column is nullable or defaulted.

-- AlterTable
ALTER TABLE "jobs"
ADD COLUMN "careRecipientId" UUID,
ADD COLUMN "city" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "postalCode" TEXT,
ADD COLUMN "careFrequency" "CareFrequency",
ADD COLUMN "careTasks" "CareTask"[] DEFAULT ARRAY[]::"CareTask"[],
ADD COLUMN "visitDate" DATE,
ADD COLUMN "visitStartTime" TEXT,
ADD COLUMN "visitEndTime" TEXT,
ADD COLUMN "visitNotes" TEXT,
ADD COLUMN "hoursPerWeek" INTEGER,
ADD COLUMN "careDuration" "CareDuration",
ADD COLUMN "careUrgency" "CareUrgency",
ADD COLUMN "scheduleFlexible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "needsOvernightCare" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "needsLiveInCare" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "needsEmergencyCover" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "requiresCaregiverVehicle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "requiresWheelchairAccessibleVehicle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "petsInHome" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "homeAccessibility" "HomeAccessibility"[] DEFAULT ARRAY[]::"HomeAccessibility"[],
ADD COLUMN "specialRequirements" TEXT,
ADD COLUMN "paymentType" "PaymentType",
ADD COLUMN "budgetCents" INTEGER,
ADD COLUMN "preferredCaregiverGender" "PreferredCaregiverGender",
ADD COLUMN "preferredCaregiverLanguage" "SpokenLanguage",
ADD COLUMN "requiredQualifications" "ProfessionalQualification"[] DEFAULT ARRAY[]::"ProfessionalQualification"[],
ADD COLUMN "minYearsExperience" INTEGER,
ADD COLUMN "culturalConsiderations" TEXT;

-- CreateTable
-- Weekdays a recurring job needs care on (ALL_DAY or AVAILABLE_WINDOWS).
CREATE TABLE "job_schedule_days" (
    "jobId" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "mode" "DayAvailabilityMode" NOT NULL,

    CONSTRAINT "job_schedule_days_pkey" PRIMARY KEY ("jobId", "dayOfWeek")
);

-- CreateTable
-- Hours care is needed on a weekday ("HH:mm"; overnight via "endsNextDay").
CREATE TABLE "job_schedule_windows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "jobId" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "endsNextDay" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "job_schedule_windows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jobs_careRecipientId_idx" ON "jobs"("careRecipientId");

-- CreateIndex
CREATE INDEX "jobs_status_careFrequency_idx" ON "jobs"("status", "careFrequency");

-- CreateIndex
CREATE INDEX "jobs_state_postalCode_idx" ON "jobs"("state", "postalCode");

-- CreateIndex
CREATE INDEX "jobs_careTasks_idx" ON "jobs" USING GIN ("careTasks");

-- CreateIndex
CREATE INDEX "job_schedule_days_dayOfWeek_mode_idx" ON "job_schedule_days"("dayOfWeek", "mode");

-- CreateIndex
CREATE INDEX "job_schedule_windows_jobId_idx" ON "job_schedule_windows"("jobId");

-- CreateIndex
CREATE INDEX "job_schedule_windows_dayOfWeek_startTime_endTime_idx" ON "job_schedule_windows"("dayOfWeek", "startTime", "endTime");

-- AddForeignKey
ALTER TABLE "jobs"
  ADD CONSTRAINT "jobs_careRecipientId_fkey"
  FOREIGN KEY ("careRecipientId") REFERENCES "care_recipients"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_schedule_days"
  ADD CONSTRAINT "job_schedule_days_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "jobs"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_schedule_windows"
  ADD CONSTRAINT "job_schedule_windows_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "jobs"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
