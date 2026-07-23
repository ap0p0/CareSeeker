-- AlterEnum
ALTER TYPE "BasicCareNeed" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "seekers_info" ADD COLUMN "otherCareNeedDetails" TEXT;
