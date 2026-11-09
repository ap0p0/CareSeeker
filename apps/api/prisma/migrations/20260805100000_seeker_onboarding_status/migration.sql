-- Seeker registration: finished the flow / reviewed and confirmed the summary
-- (same meaning as the columns on "providers_info").
ALTER TABLE "seekers_info"
ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN "profileConfirmedAt" TIMESTAMP(3);
