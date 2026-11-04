-- Provider onboarding step 2: services offered, skills & experience, job interests.
-- Multi-select answers are stored relationally (one row per selection) so they
-- can be filtered / matched directly.

-- CreateEnum
CREATE TYPE "CareServiceCategory" AS ENUM ('ELDERLY_CARE', 'CHILD_CARE', 'DISABILITY_ASSISTANCE', 'PERSONAL_CARE', 'COMPANIONSHIP', 'HOUSEHOLD_ASSISTANCE', 'MEDICAL_NURSING', 'OTHER');

-- CreateEnum
CREATE TYPE "CareSkill" AS ENUM ('FIRST_AID_CPR', 'MEDICATION_MANAGEMENT', 'MOBILITY_TRANSFER_ASSISTANCE', 'DEMENTIA_ALZHEIMERS_CARE', 'MEAL_PREPARATION', 'HOUSEKEEPING', 'PERSONAL_HYGIENE_ASSISTANCE', 'TRANSPORTATION', 'COMPANIONSHIP_EMOTIONAL_SUPPORT', 'CHILD_DEVELOPMENT', 'SPECIAL_NEEDS_SUPPORT', 'PALLIATIVE_HOSPICE_CARE', 'OTHER');

-- CreateEnum
CREATE TYPE "ProfessionalQualification" AS ENUM ('CNA', 'HHA', 'RN', 'LPN_LVN', 'CPR_FIRST_AID_CERTIFICATION', 'CAREGIVER_CERTIFICATION', 'EARLY_CHILDHOOD_EDUCATION', 'SOCIAL_WORK', 'NURSING_DEGREE', 'OTHER');

-- CreateEnum
CREATE TYPE "CareTask" AS ENUM ('BATHING_HYGIENE', 'TOILETING_INCONTINENCE_CARE', 'DRESSING_GROOMING', 'FEEDING_ASSISTANCE', 'MEAL_PREPARATION', 'MEDICATION_REMINDERS', 'MOBILITY_TRANSFERS', 'HEAVY_LIFTING', 'LIGHT_HOUSEKEEPING', 'LAUNDRY', 'SHOPPING_ERRANDS', 'TRANSPORTATION_DRIVING', 'COMPANIONSHIP', 'OVERNIGHT_CARE', 'PET_CARE');

-- CreateEnum
CREATE TYPE "TaskPreference" AS ENUM ('WILLING', 'UNWILLING');

-- CreateEnum
CREATE TYPE "ClientGroup" AS ENUM ('SENIORS', 'ADULTS_WITH_DISABILITIES', 'CHILDREN', 'INFANTS_TODDLERS', 'PEOPLE_WITH_DEMENTIA', 'POST_SURGERY_RECOVERY', 'CHRONIC_ILLNESS', 'HOSPICE_PALLIATIVE', 'MENTAL_HEALTH', 'VETERANS');

-- CreateTable
CREATE TABLE "provider_service_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "otherCareService" TEXT,
    "otherSkill" TEXT,
    "yearsOfExperience" INTEGER NOT NULL,
    "previousCareExperience" TEXT NOT NULL,
    "otherQualification" TEXT,
    "otherLanguage" TEXT,
    "coverLetter" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_service_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_care_services" (
    "provider_id" UUID NOT NULL,
    "service" "CareServiceCategory" NOT NULL,

    CONSTRAINT "provider_care_services_pkey" PRIMARY KEY ("provider_id", "service")
);

-- CreateTable
CREATE TABLE "provider_skills" (
    "provider_id" UUID NOT NULL,
    "skill" "CareSkill" NOT NULL,

    CONSTRAINT "provider_skills_pkey" PRIMARY KEY ("provider_id", "skill")
);

-- CreateTable
CREATE TABLE "provider_qualifications" (
    "provider_id" UUID NOT NULL,
    "qualification" "ProfessionalQualification" NOT NULL,

    CONSTRAINT "provider_qualifications_pkey" PRIMARY KEY ("provider_id", "qualification")
);

-- CreateTable
CREATE TABLE "provider_languages" (
    "provider_id" UUID NOT NULL,
    "language" "SpokenLanguage" NOT NULL,

    CONSTRAINT "provider_languages_pkey" PRIMARY KEY ("provider_id", "language")
);

-- CreateTable
CREATE TABLE "provider_job_categories" (
    "provider_id" UUID NOT NULL,
    "category" "CareServiceCategory" NOT NULL,

    CONSTRAINT "provider_job_categories_pkey" PRIMARY KEY ("provider_id", "category")
);

-- CreateTable
CREATE TABLE "provider_task_preferences" (
    "provider_id" UUID NOT NULL,
    "task" "CareTask" NOT NULL,
    "preference" "TaskPreference" NOT NULL,

    CONSTRAINT "provider_task_preferences_pkey" PRIMARY KEY ("provider_id", "task")
);

-- CreateTable
CREATE TABLE "provider_client_groups" (
    "provider_id" UUID NOT NULL,
    "client_group" "ClientGroup" NOT NULL,

    CONSTRAINT "provider_client_groups_pkey" PRIMARY KEY ("provider_id", "client_group")
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_service_profiles_userId_key" ON "provider_service_profiles"("userId");
CREATE INDEX "provider_service_profiles_yearsOfExperience_idx" ON "provider_service_profiles"("yearsOfExperience");
CREATE INDEX "provider_care_services_service_idx" ON "provider_care_services"("service");
CREATE INDEX "provider_skills_skill_idx" ON "provider_skills"("skill");
CREATE INDEX "provider_qualifications_qualification_idx" ON "provider_qualifications"("qualification");
CREATE INDEX "provider_languages_language_idx" ON "provider_languages"("language");
CREATE INDEX "provider_job_categories_category_idx" ON "provider_job_categories"("category");
CREATE INDEX "provider_task_preferences_task_preference_idx" ON "provider_task_preferences"("task", "preference");
CREATE INDEX "provider_client_groups_client_group_idx" ON "provider_client_groups"("client_group");

-- AddForeignKey
ALTER TABLE "provider_service_profiles" ADD CONSTRAINT "provider_service_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "provider_care_services" ADD CONSTRAINT "provider_care_services_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "provider_skills" ADD CONSTRAINT "provider_skills_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "provider_qualifications" ADD CONSTRAINT "provider_qualifications_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "provider_languages" ADD CONSTRAINT "provider_languages_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "provider_job_categories" ADD CONSTRAINT "provider_job_categories_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "provider_task_preferences" ADD CONSTRAINT "provider_task_preferences_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "provider_client_groups" ADD CONSTRAINT "provider_client_groups_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
