import { getSupabaseAdminClient } from '../auth/supabase-admin';
import { SupabaseFileStorage } from './supabase-file-storage';

jest.mock('../auth/supabase-admin', () => ({
  getSupabaseAdminClient: jest.fn(),
}));

describe('SupabaseFileStorage bucket safety', () => {
  const getBucket = jest.fn();
  const createBucket = jest.fn();
  const upload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getSupabaseAdminClient as jest.Mock).mockReturnValue({
      storage: {
        getBucket,
        createBucket,
        from: () => ({ upload }),
      },
    });
    upload.mockResolvedValue({ data: {}, error: null });
    createBucket.mockResolvedValue({
      data: { name: 'provider-documents' },
      error: null,
    });
  });

  const file = { buffer: Buffer.from('x'), contentType: 'application/pdf' };

  it('uploads to an existing private bucket', async () => {
    getBucket.mockResolvedValue({
      data: { name: 'provider-documents', public: false },
      error: null,
    });

    await new SupabaseFileStorage().upload(
      'provider-documents',
      'p/a.pdf',
      file,
    );

    expect(createBucket).not.toHaveBeenCalled();
    expect(upload).toHaveBeenCalledWith(
      'p/a.pdf',
      file.buffer,
      expect.objectContaining({ upsert: false }),
    );
  });

  it('refuses to write into a public bucket', async () => {
    getBucket.mockResolvedValue({
      data: { name: 'provider-documents', public: true },
      error: null,
    });

    await expect(
      new SupabaseFileStorage().upload('provider-documents', 'p/a.pdf', file),
    ).rejects.toMatchObject({ code: 'BUCKET_UNAVAILABLE' });
    expect(upload).not.toHaveBeenCalled();
  });

  it('refuses when the bucket state cannot be read', async () => {
    getBucket.mockResolvedValue({
      data: null,
      error: { message: 'permission denied' },
    });

    await expect(
      new SupabaseFileStorage().upload('provider-documents', 'p/a.pdf', file),
    ).rejects.toMatchObject({ code: 'BUCKET_UNAVAILABLE' });
    expect(createBucket).not.toHaveBeenCalled();
  });

  it('creates a private bucket when it does not exist yet', async () => {
    getBucket.mockResolvedValue({
      data: null,
      error: { message: 'Bucket not found' },
    });

    await new SupabaseFileStorage({
      'provider-documents': { fileSizeLimit: 1 },
    }).upload('provider-documents', 'p/a.pdf', file);

    expect(createBucket).toHaveBeenCalledWith(
      'provider-documents',
      expect.objectContaining({ public: false, fileSizeLimit: 1 }),
    );
    expect(upload).toHaveBeenCalled();
  });
});
