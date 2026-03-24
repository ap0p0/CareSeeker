-- CreateEnum
CREATE TYPE "PresignupType" AS ENUM ('SEEKER', 'PROVIDER');

-- CreateTable
CREATE TABLE "presignups" (
    "id" TEXT NOT NULL,
    "type" "PresignupType" NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "state" TEXT,
    "city" TEXT,
    "phone" TEXT,
    "accepted" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presignups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "presignups_email_key" ON "presignups"("email");
