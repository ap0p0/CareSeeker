-- CreateEnum
-- Read from the registrant's side: 'CHILD' = "I am their child".
CREATE TYPE "RegistrantRelationship" AS ENUM (
  'PARENT',
  'CHILD',
  'SPOUSE_PARTNER',
  'SIBLING',
  'GRANDPARENT',
  'GRANDCHILD',
  'OTHER_RELATIVE',
  'FRIEND_NEIGHBOR',
  'LEGAL_GUARDIAN',
  'OTHER'
);

-- CreateTable
-- Seeker registration on behalf of someone else, step 1 (the registrant).
-- The registrant is the account holder: name, surname and email live on
-- "users"; this table holds what is specific to acting for another person.
-- Accounts with a row here have "seekers_info"."careFor" = 'OTHER'.
CREATE TABLE "registrants_info" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "phone" TEXT NOT NULL,
    "relationship" "RegistrantRelationship" NOT NULL,
    "relationshipOther" TEXT,
    "consentConfirmedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrants_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "registrants_info_userId_key" ON "registrants_info"("userId");

-- CreateIndex
CREATE INDEX "registrants_info_relationship_idx" ON "registrants_info"("relationship");

-- AddForeignKey
ALTER TABLE "registrants_info"
  ADD CONSTRAINT "registrants_info_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
