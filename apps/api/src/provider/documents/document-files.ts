import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { extname } from 'node:path';
import type { UploadedFile } from '../common/uploaded-file';
import {
  isJpeg,
  isPdf,
  isPng,
  isWordDoc,
  isWordDocx,
} from './document-content';

export const DOCUMENT_FIELD = 'files' as const;
export const DOCUMENT_MAX_BYTES = 15 * 1024 * 1024;
export const MAX_FILES_PER_UPLOAD = 10;
/** Active (non-deleted) documents a provider may hold in total. */
export const MAX_ACTIVE_DOCUMENTS = 30;
const ORIGINAL_FILENAME_MAX_LENGTH = 200;

export type DocumentFileType = {
  extension: string;
  mimeType: string;
  /** Structural content check (see `document-content.ts`). */
  matches: (buffer: Buffer) => boolean;
};

/** Supported document types: PDF, Word (.doc / .docx), JPG, PNG. */
export const DOCUMENT_FILE_TYPES: readonly DocumentFileType[] = [
  { extension: 'pdf', mimeType: 'application/pdf', matches: isPdf },
  { extension: 'doc', mimeType: 'application/msword', matches: isWordDoc },
  {
    extension: 'docx',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    matches: isWordDocx,
  },
  { extension: 'jpg', mimeType: 'image/jpeg', matches: isJpeg },
  { extension: 'png', mimeType: 'image/png', matches: isPng },
];

const EXTENSION_ALIASES: Record<string, string> = { jpeg: 'jpg' };

export const DOCUMENT_EXTENSIONS = [
  ...DOCUMENT_FILE_TYPES.map((type) => type.extension),
  ...Object.keys(EXTENSION_ALIASES),
];

/** Declared types accepted at the multipart boundary (before content sniffing). */
const ACCEPTED_DECLARED_MIME_TYPES = new Set<string>([
  ...DOCUMENT_FILE_TYPES.map((type) => type.mimeType),
  // Some browsers / OSes send Word files or unknown extensions as a generic
  // stream; the extension + content check below still has to pass.
  'application/octet-stream',
]);

export function normalizedExtension(filename: string): string {
  const raw = extname(filename).slice(1).toLowerCase();
  return EXTENSION_ALIASES[raw] ?? raw;
}

/** Strips any path component and caps the length; keeps the extension. */
export function sanitizeOriginalFilename(filename: string): string {
  const base = filename.split(/[\\/]/).pop()?.trim() ?? '';
  const cleaned =
    Array.from(base)
      .filter((char) => {
        const code = char.charCodeAt(0);
        return code > 0x1f && code !== 0x7f; // drop control characters
      })
      .join('') || 'document';
  if (cleaned.length <= ORIGINAL_FILENAME_MAX_LENGTH) return cleaned;

  const ext = extname(cleaned);
  return `${cleaned.slice(0, ORIGINAL_FILENAME_MAX_LENGTH - ext.length)}${ext}`;
}

/**
 * Resolves the canonical type of an upload, or returns an error message.
 * Checks, in order: extension, declared MIME type, size, and file content.
 */
export function inspectDocumentFile(
  file: UploadedFile,
): { ok: true; type: DocumentFileType } | { ok: false; reason: string } {
  const extension = normalizedExtension(file.originalname);
  const type = DOCUMENT_FILE_TYPES.find((item) => item.extension === extension);
  const label = `"${sanitizeOriginalFilename(file.originalname)}"`;

  if (!type) {
    return {
      ok: false,
      reason: `${label}: only PDF, DOC, DOCX, JPG and PNG files are allowed`,
    };
  }

  if (
    file.mimetype !== type.mimeType &&
    !ACCEPTED_DECLARED_MIME_TYPES.has(file.mimetype)
  ) {
    return {
      ok: false,
      reason: `${label}: unexpected file type ${file.mimetype}`,
    };
  }

  if (!file.buffer || file.size === 0) {
    return { ok: false, reason: `${label}: the file is empty` };
  }

  if (file.size > DOCUMENT_MAX_BYTES) {
    return {
      ok: false,
      reason: `${label}: files must be ${DOCUMENT_MAX_BYTES / (1024 * 1024)} MB or smaller`,
    };
  }

  if (!type.matches(file.buffer)) {
    return {
      ok: false,
      reason: `${label}: the content does not look like a .${type.extension} file`,
    };
  }

  return { ok: true, type };
}

/** Multer options for every endpoint that accepts provider documents. */
export const documentUploadOptions: MulterOptions = {
  limits: {
    fileSize: DOCUMENT_MAX_BYTES,
    files: MAX_FILES_PER_UPLOAD,
  },
  fileFilter: (_req, file, callback) => {
    const extension = normalizedExtension(file.originalname);
    const known = DOCUMENT_FILE_TYPES.some(
      (type) => type.extension === extension,
    );

    if (!known || !ACCEPTED_DECLARED_MIME_TYPES.has(file.mimetype)) {
      callback(
        new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Unsupported document',
          errors: [
            `"${sanitizeOriginalFilename(file.originalname)}": only PDF, DOC, DOCX, JPG and PNG files are allowed`,
          ],
        }),
        false,
      );
      return;
    }

    callback(null, true);
  },
};
