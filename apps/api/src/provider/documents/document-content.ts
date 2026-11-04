/**
 * Content checks for uploaded documents. They parse just enough of each
 * format to reject files that merely carry the right first bytes (a renamed
 * archive, a truncated download, a PDF header glued on an executable).
 * No external dependencies, bounded work per file.
 */

const ZIP_EOCD_SIGNATURE = 0x06054b50;
const ZIP_CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const ZIP_LOCAL_FILE_SIGNATURE = 0x04034b50;
const ZIP_EOCD_MIN_SIZE = 22;
const ZIP_MAX_COMMENT_SIZE = 0xffff;
const ZIP_MAX_ENTRIES_SCANNED = 5000;

/**
 * Reads the entry names of a ZIP archive from its central directory.
 * Returns `null` when the archive structure is invalid.
 */
export function readZipEntryNames(buffer: Buffer): string[] | null {
  if (
    buffer.length < ZIP_EOCD_MIN_SIZE ||
    buffer.readUInt32LE(0) !== ZIP_LOCAL_FILE_SIGNATURE
  ) {
    return null;
  }

  // The end-of-central-directory record sits in the last 22 bytes plus an
  // optional comment of up to 64 KiB; search backwards for its signature.
  const searchStart = Math.max(
    0,
    buffer.length - ZIP_EOCD_MIN_SIZE - ZIP_MAX_COMMENT_SIZE,
  );
  let eocd = -1;
  for (let i = buffer.length - ZIP_EOCD_MIN_SIZE; i >= searchStart; i -= 1) {
    if (buffer.readUInt32LE(i) === ZIP_EOCD_SIGNATURE) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return null;

  const entryCount = buffer.readUInt16LE(eocd + 10);
  const directorySize = buffer.readUInt32LE(eocd + 12);
  const directoryOffset = buffer.readUInt32LE(eocd + 16);
  if (
    entryCount > ZIP_MAX_ENTRIES_SCANNED ||
    directoryOffset + directorySize > eocd
  ) {
    return null;
  }

  const names: string[] = [];
  let cursor = directoryOffset;
  for (let index = 0; index < entryCount; index += 1) {
    if (
      cursor + 46 > buffer.length ||
      buffer.readUInt32LE(cursor) !== ZIP_CENTRAL_DIRECTORY_SIGNATURE
    ) {
      return null;
    }

    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const nameStart = cursor + 46;
    if (nameStart + nameLength > buffer.length) return null;

    names.push(buffer.toString('utf8', nameStart, nameStart + nameLength));
    cursor = nameStart + nameLength + extraLength + commentLength;
  }

  return names;
}

const DOCX_REQUIRED_PARTS = ['[Content_Types].xml', 'word/document.xml'];

/** A Word (OOXML) document: a well-formed ZIP carrying the mandatory parts. */
export function isWordDocx(buffer: Buffer): boolean {
  const names = readZipEntryNames(buffer);
  if (!names) return false;
  return DOCX_REQUIRED_PARTS.every((part) => names.includes(part));
}

const OLE2_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

/**
 * A legacy Word (.doc) file: an OLE2 compound file with a sane header
 * (little-endian byte order marker and a 512 / 4096-byte sector size).
 */
export function isWordDoc(buffer: Buffer): boolean {
  if (buffer.length < 512) return false;
  if (!OLE2_SIGNATURE.every((byte, index) => buffer[index] === byte)) {
    return false;
  }

  const byteOrder = buffer.readUInt16LE(0x1c);
  const sectorShift = buffer.readUInt16LE(0x1e);
  return byteOrder === 0xfffe && (sectorShift === 9 || sectorShift === 12);
}

const PDF_TRAILER_WINDOW = 4096;

/** A PDF: `%PDF-` header and an `%%EOF` marker in the trailer region. */
export function isPdf(buffer: Buffer): boolean {
  if (buffer.length < 16 || buffer.toString('ascii', 0, 5) !== '%PDF-') {
    return false;
  }

  const tail = buffer.subarray(Math.max(0, buffer.length - PDF_TRAILER_WINDOW));
  return tail.includes('%%EOF');
}

export function isJpeg(buffer: Buffer): boolean {
  return (
    buffer.length >= 4 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  );
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function isPng(buffer: Buffer): boolean {
  return (
    buffer.length >= 16 &&
    PNG_SIGNATURE.every((byte, index) => buffer[index] === byte) &&
    // First chunk of every PNG is IHDR.
    buffer.toString('ascii', 12, 16) === 'IHDR'
  );
}
