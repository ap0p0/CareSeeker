import { Logger, Module } from '@nestjs/common';
import { getBucketPolicies } from './buckets';
import { FILE_STORAGE, type FileStorage } from './file-storage';
import { LocalFileStorage } from './local-file-storage';
import { LocalStorageController } from './local-storage.controller';
import {
  assertSupabaseStorageConfig,
  getStorageProvider,
  getUploadsDir,
} from './storage-config';
import { SupabaseFileStorage } from './supabase-file-storage';

const logger = new Logger('StorageModule');

/**
 * Provides the `FILE_STORAGE` adapter selected by `STORAGE_PROVIDER`.
 * Misconfigured Supabase storage fails here, at boot, instead of degrading
 * to the filesystem.
 */
function createFileStorage(): FileStorage {
  if (getStorageProvider() === 'local') {
    logger.warn(
      `STORAGE_PROVIDER=local — files are stored under ${getUploadsDir()} (development only).`,
    );
    return new LocalFileStorage();
  }

  assertSupabaseStorageConfig();
  return new SupabaseFileStorage(getBucketPolicies());
}

@Module({
  // Signed-URL reads for the local adapter only (profile pictures).
  controllers: getStorageProvider() === 'local' ? [LocalStorageController] : [],
  providers: [{ provide: FILE_STORAGE, useFactory: createFileStorage }],
  exports: [FILE_STORAGE],
})
export class StorageModule {}
