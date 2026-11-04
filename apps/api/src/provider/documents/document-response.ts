import { StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import type { DocumentDownload } from './documents.service';

const INLINE_VIEWABLE = new Set(['application/pdf', 'image/jpeg', 'image/png']);

/**
 * Streams a document with safe headers. `inline` is only honoured for types
 * browsers can render (PDF / images); everything else is always a download.
 */
export function sendDocument(
  res: Response,
  download: DocumentDownload,
  disposition: 'inline' | 'attachment',
): StreamableFile {
  const inline =
    disposition === 'inline' && INLINE_VIEWABLE.has(download.contentType);
  const asciiName = download.filename
    .replace(/[^\x20-\x7e]/g, '_')
    .replace(/"/g, "'");
  const utf8Name = encodeURIComponent(download.filename);

  res.setHeader('Content-Type', download.contentType);
  res.setHeader('Content-Length', String(download.buffer.length));
  res.setHeader(
    'Content-Disposition',
    `${inline ? 'inline' : 'attachment'}; filename="${asciiName}"; filename*=UTF-8''${utf8Name}`,
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store');

  return new StreamableFile(download.buffer);
}

export function parseDisposition(value: unknown): 'inline' | 'attachment' {
  return value === 'inline' ? 'inline' : 'attachment';
}
