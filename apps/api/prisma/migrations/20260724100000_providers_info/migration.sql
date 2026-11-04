-- CreateEnum
CREATE TYPE "ProviderGender" AS ENUM ('FEMALE', 'MALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY');

-- CreateTable
-- Provider onboarding step 1 (personal information). Name, surname and email
-- live on "users"; this table holds the remaining private personal details.
-- Addresses are US-only ("state" = USPS code, "postalCode" = ZIP).
CREATE TABLE "providers_info" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "gender" "ProviderGender",
    "phone" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "profileImagePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "providers_info_userId_key" ON "providers_info"("userId");

-- AddForeignKey
ALTER TABLE "providers_info"
  ADD CONSTRAINT "providers_info_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
