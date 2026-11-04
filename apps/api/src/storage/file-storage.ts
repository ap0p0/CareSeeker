import type { StorageProviderKind } from './storage-config';

/**
 * Abstraction over private object storage (profile pictures, provider
 * documents). Business logic, endpoints, the frontend and the database only
 * ever deal with `(bucket, key)` pairs — which adapter backs them is a
 * deployment decision (`STORAGE_PROVIDER`).
 *
 * Buckets are always private: readers go through authenticated API endpoints
 * or short-lived signed URLs, never a public folder.
 */
export type StoredFile = {
  buffer: Buffer;
  contentType: string;
};

export type StoredFileMetadata = {
  key: string;
  sizeBytes: number;
  contentType: string | null;
  lastModifiedAt: Date | null;
};

export interface FileStorage {
  readonly provider: StorageProviderKind;

  /** Stores a new object; fails if `key` already exists. */
  upload(bucket: string, key: string, file: StoredFile): Promise<void>;

  /** Overwrites (or creates) the object at `key`. */
  replace(bucket: string, key: string, file: StoredFile): Promise<void>;

  /** Returns the object, or `null` when it does not exist. */
  download(bucket: string, key: string): Promise<StoredFile | null>;

  /** Best-effort removal; must not throw. */
  remove(bucket: string, key: string): Promise<void>;

  /** Returns size / type / modification time, or `null` when missing. */
  getMetadata(bucket: string, key: string): Promise<StoredFileMetadata | null>;

  /** Short-lived URL for direct reads; `null` when it cannot be produced. */
  getSignedUrl(
    bucket: string,
    key: string,
    expiresInSeconds: number,
  ): Promise<string | null>;
}

export class FileStorageError extends Error {
  constructor(
    message: string,
    readonly code: 'UPLOAD_FAILED' | 'BUCKET_UNAVAILABLE' | 'DOWNLOAD_FAILED',
  ) {
    super(message);
    this.name = 'FileStorageError';
  }
}

export const FILE_STORAGE = Symbol('FILE_STORAGE');
