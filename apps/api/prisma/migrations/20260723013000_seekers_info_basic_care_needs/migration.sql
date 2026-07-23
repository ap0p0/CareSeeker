-- CreateEnum
CREATE TYPE "BasicCareNeed" AS ENUM (
  'CLEANING',
  'COOKING',
  'HYGIENE',
  'COMPANIONSHIP',
  'ERRANDS',
  'LAUNDRY',
  'MOBILITY_SUPPORT',
  'TRANSPORTATION'
);

-- AlterTable
ALTER TABLE "seekers_info"
  ADD COLUMN "basicCareNeeds" "BasicCareNeed"[] NOT NULL DEFAULT ARRAY[]::"BasicCareNeed"[];
