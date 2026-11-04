-- Provider onboarding step 3: supporting documents (metadata only; file bytes
-- live in the configured FileStorage under "storage_key").

-- CreateEnum
CREATE TYPE "ProviderDocumentCategory" AS ENUM ('CV_RESUME', 'REFERENCE_LETTER', 'EDUCATIONAL_CERTIFICATE', 'PROFESSIONAL_CERTIFICATE', 'MEDICAL_LICENSE_PERMIT', 'OTHER');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('LOCAL', 'SUPABASE');

-- CreateTable
CREATE TABLE "provider_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider_id" UUID NOT NULL,
    "category" "ProviderDocumentCategory" NOT NULL,
    "original_filename" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "storage_provider" "StorageProvider" NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "provider_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_documents_storage_key_key" ON "provider_documents"("storage_key");
CREATE INDEX "provider_documents_provider_id_deleted_at_idx" ON "provider_documents"("provider_id", "deleted_at");
CREATE INDEX "provider_documents_provider_id_category_idx" ON "provider_documents"("provider_id", "category");

-- AddForeignKey
ALTER TABLE "provider_documents" ADD CONSTRAINT "provider_documents_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
