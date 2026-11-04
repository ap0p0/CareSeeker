import {
  isPdf,
  isPng,
  isWordDoc,
  isWordDocx,
  readZipEntryNames,
} from './document-content';

// Archives generated with Python's zipfile (deflate) so the central directory
// layout is the real thing, not a hand-rolled approximation.
const DOCX = Buffer.from(
  'UEsDBBQAAAAIANYDY13HHBc8CgAAAAgAAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbLMJqSxILda3AwBQSwMEFAAAAAgA1gNjXf0BsR8GAAAABAAAAAsAAABfcmVscy8ucmVsc7Mp0rcDAFBLAwQUAAAACADWA2Nd3VqGDQ8AAAANAAAAEQAAAHdvcmQvZG9jdW1lbnQueG1ssym3SslPLs1NzSvRtwMAUEsBAhQDFAAAAAgA1gNjXcccFzwKAAAACAAAABMAAAAAAAAAAAAAAIABAAAAAFtDb250ZW50X1R5cGVzXS54bWxQSwECFAMUAAAACADWA2Nd/QGxHwYAAAAEAAAACwAAAAAAAAAAAAAAgAE7AAAAX3JlbHMvLnJlbHNQSwECFAMUAAAACADWA2Nd3VqGDQ8AAAANAAAAEQAAAAAAAAAAAAAAgAFqAAAAd29yZC9kb2N1bWVudC54bWxQSwUGAAAAAAMAAwC5AAAAqAAAAAAA',
  'base64',
);
const XLSX = Buffer.from(
  'UEsDBBQAAAAIANYDY13HHBc8CgAAAAgAAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbLMJqSxILda3AwBQSwMEFAAAAAgA1gNjXRbDehkGAAAABAAAAA8AAAB4bC93b3JrYm9vay54bWyzKde3AwBQSwECFAMUAAAACADWA2NdxxwXPAoAAAAIAAAAEwAAAAAAAAAAAAAAgAEAAAAAW0NvbnRlbnRfVHlwZXNdLnhtbFBLAQIUAxQAAAAIANYDY10Ww3oZBgAAAAQAAAAPAAAAAAAAAAAAAACAATsAAAB4bC93b3JrYm9vay54bWxQSwUGAAAAAAIAAgB+AAAAbgAAAAAA',
  'base64',
);
const ZIP_WITH_WORD_FOLDER = Buffer.from(
  'UEsDBBQAAAAIANYDY12GphA2BwAAAAUAAAAOAAAAd29yZC9ub3Rlcy50eHTLSM3JyQcAUEsBAhQDFAAAAAgA1gNjXYamEDYHAAAABQAAAA4AAAAAAAAAAAAAAIABAAAAAHdvcmQvbm90ZXMudHh0UEsFBgAAAAABAAEAPAAAADMAAAAAAA==',
  'base64',
);

describe('readZipEntryNames', () => {
  it('lists the entries of a valid archive', () => {
    expect(readZipEntryNames(DOCX)).toEqual([
      '[Content_Types].xml',
      '_rels/.rels',
      'word/document.xml',
    ]);
  });

  it('rejects archives without a readable central directory', () => {
    expect(
      readZipEntryNames(Buffer.from('PK\x03\x04 not really a zip word/')),
    ).toBeNull();
    expect(readZipEntryNames(DOCX.subarray(0, DOCX.length - 10))).toBeNull();
    expect(readZipEntryNames(Buffer.alloc(0))).toBeNull();
  });
});

describe('isWordDocx', () => {
  it('accepts a real OOXML Word document', () => {
    expect(isWordDocx(DOCX)).toBe(true);
  });

  it('rejects other Office archives and zips that only mention word/', () => {
    expect(isWordDocx(XLSX)).toBe(false);
    expect(isWordDocx(ZIP_WITH_WORD_FOLDER)).toBe(false);
    // The old heuristic would have accepted this: zip header + "word/" text.
    expect(
      isWordDocx(
        Buffer.concat([
          Buffer.from([0x50, 0x4b, 0x03, 0x04]),
          Buffer.from('junk word/document.xml'),
        ]),
      ),
    ).toBe(false);
  });
});

describe('isWordDoc', () => {
  const ole2 = () => {
    const buffer = Buffer.alloc(512);
    Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]).copy(buffer);
    buffer.writeUInt16LE(0xfffe, 0x1c);
    buffer.writeUInt16LE(9, 0x1e);
    return buffer;
  };

  it('accepts an OLE2 compound file with a sane header', () => {
    expect(isWordDoc(ole2())).toBe(true);
  });

  it('rejects a bare signature, bad sector sizes and short files', () => {
    expect(
      isWordDoc(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])),
    ).toBe(false);
    const badShift = ole2();
    badShift.writeUInt16LE(7, 0x1e);
    expect(isWordDoc(badShift)).toBe(false);
  });
});

describe('isPdf / isPng', () => {
  it('requires the PDF trailer, not just the header', () => {
    expect(
      isPdf(Buffer.from('%PDF-1.7\n1 0 obj<<>>endobj\ntrailer\n%%EOF\n')),
    ).toBe(true);
    expect(
      isPdf(Buffer.from('%PDF-1.7\nMZ this is really an executable')),
    ).toBe(false);
  });

  it('requires the IHDR chunk after the PNG signature', () => {
    const png = Buffer.concat([
      Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13,
      ]),
      Buffer.from('IHDR'),
      Buffer.alloc(13),
    ]);
    expect(isPng(png)).toBe(true);
    expect(
      isPng(
        Buffer.from([
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0, 0,
          0,
        ]),
      ),
    ).toBe(false);
  });
});
