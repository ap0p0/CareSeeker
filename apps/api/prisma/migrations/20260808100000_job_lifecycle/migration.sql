-- Job lifecycle driven by the seeker: pause (hidden from caregivers),
-- resume, close (archived), and when the post was last edited.

-- AlterEnum
ALTER TYPE "JobStatus" ADD VALUE 'PAUSED';
ALTER TYPE "JobStatus" ADD VALUE 'CLOSED';

-- AlterTable
ALTER TABLE "jobs"
ADD COLUMN "editedAt" TIMESTAMP(3),
ADD COLUMN "pausedAt" TIMESTAMP(3),
ADD COLUMN "closedAt" TIMESTAMP(3);
