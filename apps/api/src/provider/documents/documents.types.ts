import type { ProviderDocumentCategory } from '../../../generated/prisma/client.js';

/** API representation of a document (never exposes the storage key). */
export type ProviderDocumentResponse = {
  id: string;
  providerId: string;
  category: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProviderDocumentListResponse = {
  documents: ProviderDocumentResponse[];
  /** Remaining slots before `MAX_ACTIVE_DOCUMENTS` is reached. */
  remainingSlots: number;
};

export type UploadDocumentsResult = {
  documents: ProviderDocumentResponse[];
  /** Per-file rejections (the other files are still stored). */
  rejected: { filename: string; reason: string }[];
};

export type DocumentCategoryInput = ProviderDocumentCategory;
