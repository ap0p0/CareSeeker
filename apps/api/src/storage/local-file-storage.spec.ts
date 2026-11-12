import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalFileStorage } from './local-file-storage';

describe('LocalFileStorage', () => {
  let dir: string;
  let storage: LocalFileStorage;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'careseeker-uploads-'));
    process.env['UPLOADS_DIR'] = dir;
    storage = new LocalFileStorage();
  });

  afterEach(() => {
    delete process.env['UPLOADS_DIR'];
    rmSync(dir, { recursive: true, force: true });
  });

  it('refuses keys that could escape the uploads directory', () => {
    for (const key of [
      '../secrets.txt',
      'user/../../etc/passwd',
      '/etc/passwd',
      'user/..',
      'user/file name.pdf',
      'user/file;rm.pdf',
    ]) {
      expect(storage.resolveObjectPath('provider-documents', key)).toBeNull();
    }
    expect(storage.resolveObjectPath('bucket/../x', 'a/b.pdf')).toBeNull();
    expect(
      storage.resolveObjectPath('provider-documents', 'user-1/doc_1.pdf'),
    ).toBe(join(dir, 'provider-documents', 'user-1', 'doc_1.pdf'));
  });

  it('round-trips upload → metadata → download → replace → remove', async () => {
    const bucket = 'provider-documents';
    const key = 'p1/a.pdf';
    const pdf = {
      buffer: Buffer.from('%PDF-1.4'),
      contentType: 'application/pdf',
    };

    await storage.upload(bucket, key, pdf);
    await expect(storage.upload(bucket, key, pdf)).rejects.toMatchObject({
      code: 'UPLOAD_FAILED',
    });

    expect(await storage.getMetadata(bucket, key)).toMatchObject({
      key,
      sizeBytes: 8,
      contentType: 'application/pdf',
    });
    expect(await storage.download(bucket, key)).toEqual(pdf);

    const png = { buffer: Buffer.from('PNG!'), contentType: 'image/png' };
    await storage.replace(bucket, key, png);
    expect(await storage.download(bucket, key)).toEqual(png);

    await storage.remove(bucket, key);
    expect(await storage.download(bucket, key)).toBeNull();
    expect(await storage.getMetadata(bucket, key)).toBeNull();
    await expect(storage.remove(bucket, key)).resolves.toBeUndefined();
  });

  it('only serves signed reads with a valid, unexpired signature', async () => {
    const bucket = 'provider-profile-images';
    const key = 'p1/pic.png';
    await storage.upload(bucket, key, {
      buffer: Buffer.from('x'),
      contentType: 'image/png',
    });

    const url = new URL(
      (await storage.getSignedUrl(bucket, key, 60)) as string,
    );
    const expires = Number(url.searchParams.get('expires'));
    const signature = url.searchParams.get('signature') as string;

    expect(
      await storage.readSigned(bucket, key, expires, signature),
    ).not.toBeNull();
    expect(
      await storage.readSigned(bucket, key, expires + 1, signature),
    ).toBeNull();
    // Change the last hex digit to a *different* one: forcing it to "0"
    // was a no-op whenever the signature already ended in "0" (1 in 16).
    const tampered = `${signature.slice(0, -1)}${
      signature.endsWith('0') ? '1' : '0'
    }`;
    expect(tampered).not.toBe(signature);
    expect(await storage.readSigned(bucket, key, expires, tampered)).toBeNull();
    expect(await storage.readSigned(bucket, key, 1, signature)).toBeNull();
  });
});
