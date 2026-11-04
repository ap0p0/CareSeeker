-- Marks the end of the provider onboarding flow so /register can resume at
-- the right step after a refresh and stop redirecting once it is done.
ALTER TABLE "providers_info" ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);
