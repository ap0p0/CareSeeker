import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import type { AuthUserProvider } from '../auth/auth-user-provider';
import type { UsersService } from '../users/users.service';
import type { ProviderProfileImageStorageService } from './common/profile-image-storage.service';
import type { UploadedFile } from './common/uploaded-file';
import { ProviderService } from './provider.service';

const AUTH_USER_ID = '11111111-1111-4111-8111-111111111111';

const validBody = {
  email: 'Jane.Doe@Example.com',
  password: 'secret123',
  confirmPassword: 'secret123',
  name: 'Jane',
  surname: 'Doe',
  dateOfBirth: '1990-05-14',
  gender: 'female',
  phone: '+1 (555) 123-4567',
  addressLine1: '123 Main St',
  city: 'Austin',
  state: 'TX',
  postalCode: '78701',
};

const pngFile = (): UploadedFile => ({
  fieldname: 'profilePicture',
  originalname: 'me.png',
  mimetype: 'image/png',
  size: 16,
  buffer: Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0, 0, 0,
  ]),
});

describe('ProviderService.register', () => {
  const authUsers = {
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    updateUser: jest.fn(),
  };
  const { createUser, deleteUser } = authUsers;
  const usersService = { createProviderUser: jest.fn() };
  const storage = {
    upload: jest.fn(),
    remove: jest.fn(),
    getSignedUrl: jest.fn(),
  };

  let service: ProviderService;

  beforeEach(() => {
    jest.clearAllMocks();
    createUser.mockResolvedValue({
      id: AUTH_USER_ID,
      email: 'jane.doe@example.com',
    });
    deleteUser.mockResolvedValue(undefined);
    storage.upload.mockResolvedValue(`${AUTH_USER_ID}/profile-abc.png`);
    storage.remove.mockResolvedValue(undefined);
    usersService.createProviderUser.mockResolvedValue({
      id: AUTH_USER_ID,
      email: 'jane.doe@example.com',
      name: 'Jane',
      surname: 'Doe',
      role: 'PROVIDER',
      providerVerificationStatus: 'PENDING',
    });

    service = new ProviderService(
      usersService as unknown as UsersService,
      storage as unknown as ProviderProfileImageStorageService,
      authUsers as unknown as AuthUserProvider,
    );
  });

  it('creates the auth user, uploads the picture and persists user + personal info', async () => {
    const result = await service.register(validBody, pngFile());

    expect(createUser).toHaveBeenCalledWith({
      email: 'jane.doe@example.com',
      password: 'secret123',
    });
    expect(storage.upload).toHaveBeenCalledWith(
      AUTH_USER_ID,
      expect.objectContaining({ mimetype: 'image/png' }),
    );
    expect(usersService.createProviderUser).toHaveBeenCalledWith(
      AUTH_USER_ID,
      'jane.doe@example.com',
      {
        name: 'Jane',
        surname: 'Doe',
        personalInfo: {
          dateOfBirth: new Date('1990-05-14T00:00:00.000Z'),
          gender: 'FEMALE',
          phone: '+15551234567',
          addressLine1: '123 Main St',
          city: 'Austin',
          state: 'TX',
          postalCode: '78701',
          profileImagePath: `${AUTH_USER_ID}/profile-abc.png`,
        },
      },
    );
    expect(result).toEqual({
      id: AUTH_USER_ID,
      email: 'jane.doe@example.com',
      name: 'Jane',
      surname: 'Doe',
      role: 'provider',
      providerVerificationStatus: 'pending',
    });
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('rejects invalid payloads before touching Supabase', async () => {
    const invalid = {
      ...validBody,
      dateOfBirth: '2015-01-01',
      phone: 'abc',
      confirmPassword: 'different',
      city: '',
    };

    await expect(service.register(invalid, pngFile())).rejects.toMatchObject({
      response: {
        code: 'VALIDATION_ERROR',
        errors: expect.arrayContaining([
          'confirmPassword must match password',
          'dateOfBirth must be at least 18 years before today',
          expect.stringContaining('phone must be a valid US'),
          'city is required',
        ]),
      },
    });
    expect(createUser).not.toHaveBeenCalled();
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('requires a real image file', async () => {
    await expect(service.register(validBody, undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    const spoofed = { ...pngFile(), buffer: Buffer.alloc(16, 0) };
    await expect(service.register(validBody, spoofed)).rejects.toMatchObject({
      response: {
        errors: ['profilePicture does not look like a valid image file'],
      },
    });
    expect(createUser).not.toHaveBeenCalled();
  });

  it('propagates duplicate-email conflicts from the auth provider', async () => {
    createUser.mockRejectedValue(
      new ConflictException({ code: 'DUPLICATE_EMAIL', message: 'taken' }),
    );

    await expect(service.register(validBody, pngFile())).rejects.toMatchObject({
      response: { code: 'DUPLICATE_EMAIL' },
    });
    expect(storage.upload).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('rolls back the auth user and picture when the database write fails', async () => {
    usersService.createProviderUser.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(service.register(validBody, pngFile())).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(storage.remove).toHaveBeenCalledWith(
      `${AUTH_USER_ID}/profile-abc.png`,
    );
    expect(deleteUser).toHaveBeenCalledWith(AUTH_USER_ID);
  });

  it('rolls back the auth user when the picture upload fails', async () => {
    storage.upload.mockRejectedValue(new Error('storage down'));

    await expect(service.register(validBody, pngFile())).rejects.toThrow(
      'storage down',
    );
    expect(usersService.createProviderUser).not.toHaveBeenCalled();
    expect(storage.remove).toHaveBeenCalledWith(null);
    expect(deleteUser).toHaveBeenCalledWith(AUTH_USER_ID);
  });
});
