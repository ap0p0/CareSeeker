import type { UploadedFile } from '../common/uploaded-file';
import {
  DOCUMENT_MAX_BYTES,
  inspectDocumentFile,
  sanitizeOriginalFilename,
} from './document-files';

const file = (
  originalname: string,
  mimetype: string,
  buffer: Buffer,
): UploadedFile => ({
  fieldname: 'files',
  originalname,
  mimetype,
  size: buffer.length,
  buffer,
});

const PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\n%%EOF\n');
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]),
  Buffer.from('IHDR'),
  Buffer.alloc(13),
]);
// Real OOXML archive (generated with zipfile) — see document-content.spec.ts.
const DOCX = Buffer.from(
  'UEsDBBQAAAAIANYDY13HHBc8CgAAAAgAAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbLMJqSxILda3AwBQSwMEFAAAAAgA1gNjXf0BsR8GAAAABAAAAAsAAABfcmVscy8ucmVsc7Mp0rcDAFBLAwQUAAAACADWA2Nd3VqGDQ8AAAANAAAAEQAAAHdvcmQvZG9jdW1lbnQueG1ssym3SslPLs1NzSvRtwMAUEsBAhQDFAAAAAgA1gNjXcccFzwKAAAACAAAABMAAAAAAAAAAAAAAIABAAAAAFtDb250ZW50X1R5cGVzXS54bWxQSwECFAMUAAAACADWA2Nd/QGxHwYAAAAEAAAACwAAAAAAAAAAAAAAgAE7AAAAX3JlbHMvLnJlbHNQSwECFAMUAAAACADWA2Nd3VqGDQ8AAAANAAAAEQAAAAAAAAAAAAAAgAFqAAAAd29yZC9kb2N1bWVudC54bWxQSwUGAAAAAAMAAwC5AAAAqAAAAAAA',
  'base64',
);

describe('inspectDocumentFile', () => {
  it('accepts supported types and resolves the canonical MIME type', () => {
    expect(
      inspectDocumentFile(file('cv.PDF', 'application/pdf', PDF)),
    ).toMatchObject({
      ok: true,
      type: { extension: 'pdf', mimeType: 'application/pdf' },
    });
    expect(
      inspectDocumentFile(
        file('photo.jpeg', 'image/jpeg', Buffer.from([0xff, 0xd8, 0xff, 0])),
      ),
    ).toMatchObject({
      ok: true,
      type: { extension: 'jpg' },
    });
    // Generic stream from the browser, decided by extension + content.
    expect(
      inspectDocumentFile(file('ref.docx', 'application/octet-stream', DOCX)),
    ).toMatchObject({
      ok: true,
      type: {
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
    });
  });

  it('rejects unknown extensions, mismatched declared types and spoofed content', () => {
    expect(
      inspectDocumentFile(file('run.exe', 'application/octet-stream', PDF)),
    ).toMatchObject({
      ok: false,
      reason: expect.stringContaining('only PDF, DOC, DOCX, JPG and PNG'),
    });
    expect(inspectDocumentFile(file('cv.pdf', 'text/html', PDF))).toMatchObject(
      {
        ok: false,
        reason: expect.stringContaining('unexpected file type'),
      },
    );
    expect(
      inspectDocumentFile(file('cv.pdf', 'application/pdf', PNG)),
    ).toMatchObject({
      ok: false,
      reason: expect.stringContaining('does not look like a .pdf'),
    });
    // A plain zip is not a Word document.
    expect(
      inspectDocumentFile(
        file(
          'x.docx',
          'application/octet-stream',
          Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0]),
        ),
      ),
    ).toMatchObject({ ok: false });
  });

  it('rejects empty and oversized files', () => {
    expect(
      inspectDocumentFile(file('cv.pdf', 'application/pdf', Buffer.alloc(0))),
    ).toMatchObject({
      ok: false,
      reason: expect.stringContaining('empty'),
    });
    const big = file('cv.pdf', 'application/pdf', PDF);
    big.size = DOCUMENT_MAX_BYTES + 1;
    expect(inspectDocumentFile(big)).toMatchObject({
      ok: false,
      reason: expect.stringContaining('15 MB'),
    });
  });
});

describe('sanitizeOriginalFilename', () => {
  it('strips paths and control characters and caps the length', () => {
    expect(sanitizeOriginalFilename('../../etc/passwd')).toBe('passwd');
    expect(sanitizeOriginalFilename('C:\\Users\\me\\My CV.pdf')).toBe(
      'My CV.pdf',
    );
    expect(sanitizeOriginalFilename('bad\u0000name\u001f.pdf')).toBe(
      'badname.pdf',
    );
    expect(sanitizeOriginalFilename('   ')).toBe('document');
    const long = sanitizeOriginalFilename(`${'a'.repeat(300)}.pdf`);
    expect(long.length).toBe(200);
    expect(long.endsWith('.pdf')).toBe(true);
  });
});
