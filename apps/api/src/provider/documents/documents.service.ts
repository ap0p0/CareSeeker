import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ProviderDocumentCategory,
  StorageProvider,
  type ProviderDocument,
} from '../../../generated/prisma/client.js';
import { getProviderDocumentsBucket } from '../../storage/buckets';
import {
  FILE_STORAGE,
  FileStorageError,
  type FileStorage,
  type StoredFile,
} from '../../storage/file-storage';
import type { UploadedFile } from '../common/uploaded-file';
import { ProviderRepository } from '../provider.repository';
import {
  inspectDocumentFile,
  MAX_ACTIVE_DOCUMENTS,
  MAX_FILES_PER_UPLOAD,
  sanitizeOriginalFilename,
  type DocumentFileType,
} from './document-files';
import { ProviderDocumentsRepository } from './documents.repository';
import type {
  ProviderDocumentListResponse,
  ProviderDocumentResponse,
  UploadDocumentsResult,
} from './documents.types';

const CATEGORIES = new Set<string>(Object.values(ProviderDocumentCategory));

export type DocumentDownload = StoredFile & {
  filename: string;
  sizeBytes: number;
};

/**
 * Provider documents (onboarding step 3). Every method takes the owning
 * provider's id explicitly: provider endpoints pass the caller's id, admin
 * endpoints pass the provider they are inspecting — the data access rules are
 * identical, only the controller decides who may ask for whom.
 *
 * Storage and metadata are kept consistent by ordering: objects are written
 * before rows are created/updated, and any failed step removes what it wrote.
 */
@Injectable()
export class ProviderDocumentsService {
  private readonly logger = new Logger(ProviderDocumentsService.name);

  constructor(
    private readonly providerRepository: ProviderRepository,
    private readonly documentsRepository: ProviderDocumentsRepository,
    @Inject(FILE_STORAGE) private readonly storage: FileStorage,
  ) {}

  async list(providerId: string): Promise<ProviderDocumentListResponse> {
    await this.providerRepository.ensureByUserId(providerId);
    const documents = await this.documentsRepository.listActive(providerId);

    return {
      documents: documents.map(toResponse),
      remainingSlots: Math.max(0, MAX_ACTIVE_DOCUMENTS - documents.length),
    };
  }

  /**
   * Stores one or more files under one category. Files are validated
   * individually: valid ones are stored, invalid ones are reported back in
   * `rejected` so a multi-file upload does not fail as a whole.
   */
  async upload(
    providerId: string,
    rawCategory: unknown,
    files: UploadedFile[] | undefined,
  ): Promise<UploadDocumentsResult> {
    await this.providerRepository.ensureByUserId(providerId);
    const category = parseCategory(rawCategory);

    if (!files || files.length === 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'No files uploaded',
        errors: [
          `files is required (up to ${MAX_FILES_PER_UPLOAD} per request)`,
        ],
      });
    }

    const active = await this.documentsRepository.countActive(providerId);
    const remaining = MAX_ACTIVE_DOCUMENTS - active;
    if (remaining <= 0) {
      throw new BadRequestException({
        code: 'DOCUMENT_LIMIT_REACHED',
        message: `You can keep up to ${MAX_ACTIVE_DOCUMENTS} documents. Remove one before uploading more.`,
      });
    }

    const documents: ProviderDocumentResponse[] = [];
    const rejected: UploadDocumentsResult['rejected'] = [];

    for (const file of files) {
      const filename = sanitizeOriginalFilename(file.originalname);

      if (documents.length >= remaining) {
        rejected.push({
          filename,
          reason: `Document limit of ${MAX_ACTIVE_DOCUMENTS} reached`,
        });
        continue;
      }

      const inspection = inspectDocumentFile(file);
      if (!inspection.ok) {
        rejected.push({ filename, reason: inspection.reason });
        continue;
      }

      const created = await this.store(
        providerId,
        category,
        file,
        inspection.type,
      );
      documents.push(toResponse(created));
    }

    if (documents.length === 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'No file could be uploaded',
        errors: rejected.map((item) => item.reason),
      });
    }

    return { documents, rejected };
  }

  async download(
    providerId: string,
    documentId: string,
  ): Promise<DocumentDownload> {
    const document = await this.requireDocument(providerId, documentId);
    const file = await this.storage.download(
      getProviderDocumentsBucket(),
      document.storageKey,
    );

    if (!file) {
      this.logger.error(
        `Document ${document.id} is missing from storage (${document.storageProvider}:${document.storageKey})`,
      );
      throw new ServiceUnavailableException({
        code: 'DOCUMENT_FILE_MISSING',
        message:
          'The file for this document is not available. Please upload it again.',
      });
    }

    return {
      buffer: file.buffer,
      contentType: document.mimeType,
      filename: document.originalFilename,
      sizeBytes: document.sizeBytes,
    };
  }

  /**
   * Replaces the file (and optionally the category) of an existing document,
   * keeping its id. The new object is written under a fresh key first, the
   * row is updated, and only then is the previous object removed.
   */
  async replace(
    providerId: string,
    documentId: string,
    rawCategory: unknown,
    file: UploadedFile | undefined,
  ): Promise<ProviderDocumentResponse> {
    const document = await this.requireDocument(providerId, documentId);
    const category =
      typeof rawCategory === 'undefined' ||
      rawCategory === null ||
      rawCategory === ''
        ? undefined
        : parseCategory(rawCategory);

    if (!file) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'No file uploaded',
        errors: ['file is required'],
      });
    }

    const inspection = inspectDocumentFile(file);
    if (!inspection.ok) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Unsupported document',
        errors: [inspection.reason],
      });
    }

    const storageKey = this.buildStorageKey(providerId, inspection.type);
    await this.writeObject(storageKey, file.buffer, inspection.type.mimeType);

    let updated: ProviderDocument;
    try {
      updated = await this.documentsRepository.replace(document.id, {
        originalFilename: sanitizeOriginalFilename(file.originalname),
        storageKey,
        storageProvider: this.storageProviderValue(),
        mimeType: inspection.type.mimeType,
        sizeBytes: file.size,
        ...(category ? { category } : {}),
      });
    } catch (error) {
      await this.storage.remove(getProviderDocumentsBucket(), storageKey);
      throw error;
    }

    await this.storage.remove(
      getProviderDocumentsBucket(),
      document.storageKey,
    );
    return toResponse(updated);
  }

  /** Soft delete: the row keeps its metadata (audit) and the object is retained. */
  async softDelete(providerId: string, documentId: string): Promise<void> {
    const document = await this.requireDocument(providerId, documentId);
    await this.documentsRepository.softDelete(document.id);
  }

  private async store(
    providerId: string,
    category: ProviderDocumentCategory,
    file: UploadedFile,
    type: DocumentFileType,
  ): Promise<ProviderDocument> {
    const storageKey = this.buildStorageKey(providerId, type);
    await this.writeObject(storageKey, file.buffer, type.mimeType);

    try {
      return await this.documentsRepository.create({
        providerId,
        category,
        originalFilename: sanitizeOriginalFilename(file.originalname),
        storageKey,
        storageProvider: this.storageProviderValue(),
        mimeType: type.mimeType,
        sizeBytes: file.size,
      });
    } catch (error) {
      await this.storage.remove(getProviderDocumentsBucket(), storageKey);
      throw error;
    }
  }

  private async requireDocument(
    providerId: string,
    documentId: string,
  ): Promise<ProviderDocument> {
    const document = await this.documentsRepository.findActive(
      providerId,
      documentId,
    );

    if (!document) {
      throw new NotFoundException({
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Document not found',
      });
    }

    return document;
  }

  /** Storage problems surface as an explicit 503 rather than a generic 500. */
  private async writeObject(
    storageKey: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    try {
      await this.storage.upload(getProviderDocumentsBucket(), storageKey, {
        buffer,
        contentType,
      });
    } catch (error) {
      if (error instanceof FileStorageError) {
        throw new ServiceUnavailableException({
          code: 'DOCUMENT_STORAGE_UNAVAILABLE',
          message:
            'Document storage is not available right now. Please try again later.',
        });
      }
      throw error;
    }
  }

  /** `<providerId>/<uuid>.<ext>` — unique per upload, grouped by provider. */
  private buildStorageKey(providerId: string, type: DocumentFileType): string {
    return `${providerId}/${randomUUID()}.${type.extension}`;
  }

  private storageProviderValue(): StorageProvider {
    return this.storage.provider === 'local'
      ? StorageProvider.LOCAL
      : StorageProvider.SUPABASE;
  }
}

function parseCategory(value: unknown): ProviderDocumentCategory {
  const normalized =
    typeof value === 'string' ? value.trim().toUpperCase() : '';

  if (!CATEGORIES.has(normalized)) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Invalid document category',
      errors: [
        `category must be one of: ${Object.values(ProviderDocumentCategory)
          .map((item) => item.toLowerCase())
          .join(', ')}`,
      ],
    });
  }

  return normalized as ProviderDocumentCategory;
}

function toResponse(document: ProviderDocument): ProviderDocumentResponse {
  return {
    id: document.id,
    providerId: document.providerId,
    category: document.category.toLowerCase(),
    originalFilename: document.originalFilename,
    mimeType: document.mimeType,
    sizeBytes: document.sizeBytes,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}
