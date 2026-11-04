import { Logger } from '@nestjs/common';
import { getSupabaseAdminClient } from '../auth/supabase-admin';
import type { BucketPolicy } from './buckets';
import {
  FileStorageError,
  type FileStorage,
  type StoredFile,
  type StoredFileMetadata,
} from './file-storage';

const NOT_FOUND = /not found|does not exist|404/i;

/**
 * Supabase Storage adapter (`STORAGE_PROVIDER=supabase`). Uses the service
 * key on the backend only; buckets are private and created on first use.
 */
export class SupabaseFileStorage implements FileStorage {
  readonly provider = 'supabase' as const;
  private readonly logger = new Logger(SupabaseFileStorage.name);
  private readonly readyBuckets = new Map<string, Promise<void>>();

  constructor(
    private readonly bucketPolicies: Record<string, BucketPolicy> = {},
  ) {}

  async upload(bucket: string, key: string, file: StoredFile): Promise<void> {
    await this.write(bucket, key, file, false);
  }

  async replace(bucket: string, key: string, file: StoredFile): Promise<void> {
    await this.write(bucket, key, file, true);
  }

  async download(bucket: string, key: string): Promise<StoredFile | null> {
    const { data, error } = await getSupabaseAdminClient()
      .storage.from(bucket)
      .download(key);

    if (error) {
      if (NOT_FOUND.test(error.message)) return null;
      this.logger.error(
        `Download of "${bucket}/${key}" failed: ${error.message}`,
      );
      throw new FileStorageError(error.message, 'DOWNLOAD_FAILED');
    }

    return {
      buffer: Buffer.from(await data.arrayBuffer()),
      contentType: data.type || 'application/octet-stream',
    };
  }

  async remove(bucket: string, key: string): Promise<void> {
    try {
      const { error } = await getSupabaseAdminClient()
        .storage.from(bucket)
        .remove([key]);
      if (error) {
        this.logger.warn(
          `Could not remove "${bucket}/${key}": ${error.message}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Could not remove "${bucket}/${key}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async getMetadata(
    bucket: string,
    key: string,
  ): Promise<StoredFileMetadata | null> {
    const { data, error } = await getSupabaseAdminClient()
      .storage.from(bucket)
      .info(key);

    if (error || !data) {
      if (error && !NOT_FOUND.test(error.message)) {
        this.logger.warn(`Could not stat "${bucket}/${key}": ${error.message}`);
      }
      return null;
    }

    return {
      key,
      sizeBytes: data.size ?? 0,
      contentType: data.contentType ?? null,
      lastModifiedAt: data.lastModified ? new Date(data.lastModified) : null,
    };
  }

  async getSignedUrl(
    bucket: string,
    key: string,
    expiresInSeconds: number,
  ): Promise<string | null> {
    try {
      const { data, error } = await getSupabaseAdminClient()
        .storage.from(bucket)
        .createSignedUrl(key, expiresInSeconds);

      if (error || !data?.signedUrl) {
        this.logger.warn(
          `Could not sign "${bucket}/${key}": ${error?.message ?? 'no url'}`,
        );
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      this.logger.warn(
        `Could not sign "${bucket}/${key}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private async write(
    bucket: string,
    key: string,
    file: StoredFile,
    upsert: boolean,
  ): Promise<void> {
    await this.ensureBucket(bucket);

    const { error } = await getSupabaseAdminClient()
      .storage.from(bucket)
      .upload(key, file.buffer, {
        contentType: file.contentType,
        cacheControl: '3600',
        upsert,
      });

    if (error) {
      this.logger.error(
        `Upload to "${bucket}/${key}" failed: ${error.message}`,
      );
      throw new FileStorageError(error.message, 'UPLOAD_FAILED');
    }
  }

  private ensureBucket(bucket: string): Promise<void> {
    let ready = this.readyBuckets.get(bucket);
    if (!ready) {
      ready = this.createBucketIfMissing(bucket).catch((error) => {
        this.readyBuckets.delete(bucket);
        throw error;
      });
      this.readyBuckets.set(bucket, ready);
    }
    return ready;
  }

  /**
   * Buckets hold sensitive files, so an existing bucket is only accepted when
   * it is verifiably private. A public bucket (or one whose state cannot be
   * read) is refused rather than written to.
   */
  private async createBucketIfMissing(bucket: string): Promise<void> {
    const storage = getSupabaseAdminClient().storage;
    const { data: existing, error: lookupError } =
      await storage.getBucket(bucket);

    if (existing) {
      if (existing.public !== false) {
        this.logger.error(
          `Bucket "${bucket}" is public; refusing to store private files in it. Make it private in Supabase Storage.`,
        );
        throw new FileStorageError(
          `Bucket "${bucket}" is not private`,
          'BUCKET_UNAVAILABLE',
        );
      }
      return;
    }

    if (lookupError && !NOT_FOUND.test(lookupError.message)) {
      this.logger.error(
        `Could not verify bucket "${bucket}": ${lookupError.message}`,
      );
      throw new FileStorageError(lookupError.message, 'BUCKET_UNAVAILABLE');
    }

    const options = this.bucketPolicies[bucket] ?? {};
    const { error } = await storage.createBucket(bucket, {
      public: false,
      fileSizeLimit: options.fileSizeLimit,
      allowedMimeTypes: options.allowedMimeTypes ?? null,
    });

    // Another instance may have created it in the meantime.
    if (error && !/already exists/i.test(error.message)) {
      this.logger.error(
        `Could not create bucket "${bucket}": ${error.message}`,
      );
      throw new FileStorageError(error.message, 'BUCKET_UNAVAILABLE');
    }
  }
}
