import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

/**
 * Shape of a file parsed by multer's in-memory storage (the default used by
 * Nest's `FileInterceptor` when no `storage` option is passed).
 *
 * Declared locally so the API does not need `@types/multer` just for this.
 */
export type UploadedFile = {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export const PROFILE_IMAGE_FIELD = 'profilePicture' as const;
export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

const PROFILE_IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function isAllowedProfileImageMimeType(mimetype: string): boolean {
  return (PROFILE_IMAGE_MIME_TYPES as readonly string[]).includes(mimetype);
}

export function profileImageExtension(mimetype: string): string {
  return PROFILE_IMAGE_EXTENSIONS[mimetype] ?? 'bin';
}

/**
 * Cheap magic-number check so a renamed non-image cannot land in the bucket
 * just by spoofing the multipart `Content-Type`.
 */
export function looksLikeProfileImage(file: UploadedFile): boolean {
  const { buffer, mimetype } = file;
  if (buffer.length < 12) return false;

  switch (mimetype) {
    case 'image/jpeg':
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case 'image/png':
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      );
    case 'image/webp':
      return (
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP'
      );
    default:
      return false;
  }
}

/**
 * Validates the parsed upload (presence, type, magic bytes, size) and returns
 * it, or throws a `VALIDATION_ERROR` 400 mirroring the other validators.
 */
export function requireValidProfileImage(
  file: UploadedFile | undefined,
): UploadedFile {
  const errors: string[] = [];

  if (!file || !file.buffer || file.size === 0) {
    errors.push('profilePicture is required');
  } else {
    if (!isAllowedProfileImageMimeType(file.mimetype)) {
      errors.push('profilePicture must be a JPEG, PNG or WebP image');
    } else if (!looksLikeProfileImage(file)) {
      errors.push('profilePicture does not look like a valid image file');
    }

    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      errors.push(
        `profilePicture must be at most ${PROFILE_IMAGE_MAX_BYTES / (1024 * 1024)} MB`,
      );
    }
  }

  if (errors.length > 0 || !file) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Invalid profile picture',
      errors,
    });
  }

  return file;
}

/**
 * Multer options shared by every endpoint that accepts a profile picture
 * (registration now, profile picture replacement later).
 */
export const profileImageUploadOptions: MulterOptions = {
  limits: {
    fileSize: PROFILE_IMAGE_MAX_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!isAllowedProfileImageMimeType(file.mimetype)) {
      callback(
        new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Invalid profile picture',
          errors: ['profilePicture must be a JPEG, PNG or WebP image'],
        }),
        false,
      );
      return;
    }

    callback(null, true);
  },
};
