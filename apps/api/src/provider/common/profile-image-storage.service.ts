import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { getProviderProfileImagesBucket } from '../../storage/buckets';
import {
  FILE_STORAGE,
  FileStorageError,
  type FileStorage,
} from '../../storage/file-storage';
import { profileImageExtension, type UploadedFile } from './uploaded-file';

/** Signed URLs are short-lived; the frontend re-fetches the profile to renew. */
const SIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * Stores provider profile pictures in a **private** bucket of the configured
 * `FileStorage` (Supabase Storage, or local disk when `AUTH_MODE=local`).
 *
 * Only the object path is persisted (`providers_info.profileImagePath`); the
 * API hands out short-lived signed URLs so the bucket never has to be public.
 * Objects are namespaced per user (`<userId>/...`) so future RLS policies can
 * scope access by folder.
 */
@Injectable()
export class ProviderProfileImageStorageService {
  constructor(@Inject(FILE_STORAGE) private readonly storage: FileStorage) {}

  get bucket(): string {
    return getProviderProfileImagesBucket();
  }

  /**
   * Uploads the picture under `<userId>/profile-<random>.<ext>` and returns the
   * object path to persist. Throws a 500-style exception on storage failure.
   */
  async upload(userId: string, file: UploadedFile): Promise<string> {
    const path = `${userId}/profile-${randomUUID()}.${profileImageExtension(
      file.mimetype,
    )}`;

    try {
      await this.storage.upload(this.bucket, path, {
        buffer: file.buffer,
        contentType: file.mimetype,
      });
    } catch (error) {
      const code =
        error instanceof FileStorageError && error.code === 'BUCKET_UNAVAILABLE'
          ? 'PROFILE_IMAGE_BUCKET_UNAVAILABLE'
          : 'PROFILE_IMAGE_UPLOAD_FAILED';

      throw new InternalServerErrorException({
        code,
        message:
          code === 'PROFILE_IMAGE_BUCKET_UNAVAILABLE'
            ? 'Profile picture storage is not available. Please try again.'
            : 'Could not store the profile picture. Please try again.',
      });
    }

    return path;
  }

  /** Best-effort delete (used for rollback and when replacing a picture). */
  async remove(path: string | null | undefined): Promise<void> {
    if (!path) return;
    await this.storage.remove(this.bucket, path);
  }

  /**
   * Returns a signed URL for the stored object, or `null` when there is no
   * picture or the URL could not be generated (never fails the whole request).
   */
  async getSignedUrl(path: string | null | undefined): Promise<string | null> {
    if (!path) return null;
    return this.storage.getSignedUrl(this.bucket, path, SIGNED_URL_TTL_SECONDS);
  }
}
