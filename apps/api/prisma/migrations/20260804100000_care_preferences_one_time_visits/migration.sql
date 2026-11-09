-- Step 3 refinements:
-- * one-time visits get their own, shorter shape (date + hours + budget);
-- * the budget can be hourly or a fixed price;
-- * the "type of care" categories are no longer asked: they duplicated the
--   tasks (matching uses tasks ↔ provider tasks, recipient age / mobility ↔
--   provider client groups instead).

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('HOURLY', 'FIXED_PRICE');

-- DropIndex (the column is dropped below)
DROP INDEX IF EXISTS "care_preferences_careServices_idx";
DROP INDEX IF EXISTS "care_preferences_maxHourlyRateCents_idx";

-- AlterTable
ALTER TABLE "care_preferences"
DROP COLUMN "careServices",
DROP COLUMN "otherCareService",
ALTER COLUMN "careDuration" DROP NOT NULL,
ADD COLUMN "visitDate" DATE,
ADD COLUMN "visitStartTime" TEXT,
ADD COLUMN "visitEndTime" TEXT,
ADD COLUMN "visitNotes" TEXT,
-- Existing rows stored an hourly budget.
ADD COLUMN "paymentType" "PaymentType" NOT NULL DEFAULT 'HOURLY';

ALTER TABLE "care_preferences" ALTER COLUMN "paymentType" DROP DEFAULT;
ALTER TABLE "care_preferences" RENAME COLUMN "maxHourlyRateCents" TO "budgetCents";

-- CreateIndex
CREATE INDEX "care_preferences_visitDate_idx" ON "care_preferences"("visitDate");

-- CreateIndex
CREATE INDEX "care_preferences_paymentType_budgetCents_idx" ON "care_preferences"("paymentType", "budgetCents");
