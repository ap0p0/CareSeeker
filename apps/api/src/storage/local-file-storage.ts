import { createHmac, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, promises as fs } from 'node:fs';
import { dirname, join, normalize, resolve, sep } from 'node:path';
import { Logger } from '@nestjs/common';
import { getApiPublicUrl, getLocalAuthJwtSecret } from '../auth/auth-mode';
import {
  FileStorageError,
  type FileStorage,
  type StoredFile,
  type StoredFileMetadata,
} from './file-storage';
import { getUploadsDir } from './storage-config';

export const LOCAL_STORAGE_ROUTE = 'local-storage/file';

/** Plain path segments only: no separators, no `.`/`..`, no odd characters. */
const SAFE_SEGMENT = /^(?!\.+$)[A-Za-z0-9._-]+$/;

type SidecarMetadata = { contentType?: string };

/**
 * Filesystem adapter (`STORAGE_PROVIDER=local`). Objects live at
 * `<UPLOADS_DIR>/<bucket>/<key>` with a `.meta.json` sidecar for the content
 * type — the same `<bucket>/<key>` layout as the Supabase buckets, so switching
 * providers needs no data-model change.
 *
 * The directory is never served statically: reads go through authenticated
 * endpoints, or through `GET /local-storage/file` with an HMAC-signed,
 * expiring URL (the local stand-in for Supabase signed URLs).
 */
export class LocalFileStorage implements FileStorage {
  readonly provider = 'local' as const;
  private readonly logger = new Logger(LocalFileStorage.name);

  get rootDir(): string {
    return getUploadsDir();
  }

  /**
   * Resolves an object location, rejecting anything that is not made of plain
   * path segments (no `..`, no absolute paths, no odd characters) and anything
   * that would escape the uploads root.
   */
  resolveObjectPath(bucket: string, key: string): string | null {
    const segments = [bucket, ...key.split('/')];
    if (segments.some((segment) => !SAFE_SEGMENT.test(segment))) {
      return null;
    }

    const bucketRoot = resolve(this.rootDir, bucket);
    const full = resolve(bucketRoot, normalize(join(...segments.slice(1))));
    return full.startsWith(bucketRoot + sep) ? full : null;
  }

  async upload(bucket: string, key: string, file: StoredFile): Promise<void> {
    const full = this.requirePath(bucket, key);
    if (existsSync(full)) {
      throw new FileStorageError('Object already exists', 'UPLOAD_FAILED');
    }
    await this.write(full, file);
  }

  async replace(bucket: string, key: string, file: StoredFile): Promise<void> {
    await this.write(this.requirePath(bucket, key), file);
  }

  async download(bucket: string, key: string): Promise<StoredFile | null> {
    const full = this.resolveObjectPath(bucket, key);
    if (!full || !existsSync(full)) return null;

    const [buffer, meta] = await Promise.all([
      fs.readFile(full),
      this.readSidecar(full),
    ]);

    return {
      buffer,
      contentType: meta.contentType ?? 'application/octet-stream',
    };
  }

  async remove(bucket: string, key: string): Promise<void> {
    const full = this.resolveObjectPath(bucket, key);
    if (!full) return;

    await Promise.all(
      [full, `${full}.meta.json`].map((target) =>
        fs.rm(target, { force: true }).catch((error: unknown) => {
          this.logger.warn(
            `Could not remove "${target}": ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }),
      ),
    );
  }

  async getMetadata(
    bucket: string,
    key: string,
  ): Promise<StoredFileMetadata | null> {
    const full = this.resolveObjectPath(bucket, key);
    if (!full || !existsSync(full)) return null;

    const [stat, meta] = await Promise.all([
      fs.stat(full),
      this.readSidecar(full),
    ]);

    return {
      key,
      sizeBytes: stat.size,
      contentType: meta.contentType ?? null,
      lastModifiedAt: stat.mtime,
    };
  }

  async getSignedUrl(
    bucket: string,
    key: string,
    expiresInSeconds: number,
  ): Promise<string | null> {
    const full = this.resolveObjectPath(bucket, key);
    if (!full || !existsSync(full)) return null;

    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const url = new URL(`${getApiPublicUrl()}/${LOCAL_STORAGE_ROUTE}`);
    url.searchParams.set('bucket', bucket);
    url.searchParams.set('path', key);
    url.searchParams.set('expires', String(expires));
    url.searchParams.set('signature', this.sign(bucket, key, expires));
    return url.toString();
  }

  /** Used by the signed-URL endpoint. Returns `null` when not readable. */
  async readSigned(
    bucket: string,
    key: string,
    expires: number,
    signature: string,
  ): Promise<StoredFile | null> {
    if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) {
      return null;
    }

    const expected = Buffer.from(this.sign(bucket, key, expires));
    const actual = Buffer.from(signature);
    if (
      expected.length !== actual.length ||
      !timingSafeEqual(expected, actual)
    ) {
      return null;
    }

    return this.download(bucket, key);
  }

  private requirePath(bucket: string, key: string): string {
    const full = this.resolveObjectPath(bucket, key);
    if (!full) {
      throw new FileStorageError('Invalid object path', 'UPLOAD_FAILED');
    }
    return full;
  }

  private async write(full: string, file: StoredFile): Promise<void> {
    mkdirSync(dirname(full), { recursive: true });
    await fs.writeFile(full, file.buffer);
    await fs.writeFile(
      `${full}.meta.json`,
      JSON.stringify({
        contentType: file.contentType,
      } satisfies SidecarMetadata),
    );
  }

  private async readSidecar(full: string): Promise<SidecarMetadata> {
    try {
      return JSON.parse(
        await fs.readFile(`${full}.meta.json`, 'utf8'),
      ) as SidecarMetadata;
    } catch {
      return {};
    }
  }

  private sign(bucket: string, key: string, expires: number): string {
    return createHmac('sha256', getLocalAuthJwtSecret())
      .update(`${bucket}\n${key}\n${expires}`)
      .digest('hex');
  }
}
