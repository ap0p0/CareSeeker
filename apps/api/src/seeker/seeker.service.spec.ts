import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import type { AuthUserProvider } from '../auth/auth-user-provider';
import type { UsersService } from '../users/users.service';
import type { SeekerRepository } from './seeker.repository';
import { SeekerService } from './seeker.service';

const AUTH_USER_ID = '22222222-2222-4222-8222-222222222222';
const CONSENT_AT = new Date('2026-08-01T10:00:00.000Z');

const validBody = {
  name: 'Maria',
  surname: 'Lopez',
  email: 'Maria.Lopez@Example.com',
  password: 'secret123',
  confirmPassword: 'secret123',
  phone: '+1 (555) 123-4567',
  relationship: 'child',
  consentToActOnBehalf: true,
};

describe('SeekerService.registerOnBehalf', () => {
  const authUsers = {
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    updateUser: jest.fn(),
  };
  const { createUser, deleteUser } = authUsers;
  const usersService = {
    createSeekerUser: jest.fn(),
    createSeekerOnBehalfUser: jest.fn(),
  };
  const repository = {};

  let service: SeekerService;

  beforeEach(() => {
    jest.clearAllMocks();
    createUser.mockResolvedValue({
      id: AUTH_USER_ID,
      email: 'maria.lopez@example.com',
    });
    deleteUser.mockResolvedValue(undefined);
    usersService.createSeekerOnBehalfUser.mockResolvedValue({
      id: AUTH_USER_ID,
      email: 'maria.lopez@example.com',
      name: 'Maria',
      surname: 'Lopez',
      role: 'SEEKER',
      seekersInfo: { careFor: 'OTHER' },
      registrantsInfo: {
        phone: '+15551234567',
        relationship: 'CHILD',
        relationshipOther: null,
        consentConfirmedAt: CONSENT_AT,
      },
    });

    service = new SeekerService(
      usersService as unknown as UsersService,
      repository as unknown as SeekerRepository,
      authUsers as unknown as AuthUserProvider,
    );
  });

  it('creates the auth user and persists user + registrant info', async () => {
    const result = await service.registerOnBehalf(validBody);

    expect(createUser).toHaveBeenCalledWith({
      email: 'maria.lopez@example.com',
      password: 'secret123',
    });
    expect(usersService.createSeekerOnBehalfUser).toHaveBeenCalledWith(
      AUTH_USER_ID,
      'maria.lopez@example.com',
      {
        name: 'Maria',
        surname: 'Lopez',
        registrantInfo: {
          phone: '+15551234567',
          relationship: 'CHILD',
          relationshipOther: null,
          consentConfirmedAt: expect.any(Date) as Date,
        },
      },
    );
    expect(usersService.createSeekerUser).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: AUTH_USER_ID,
      email: 'maria.lopez@example.com',
      name: 'Maria',
      surname: 'Lopez',
      role: 'seeker',
      careFor: 'other',
      registrant: {
        phone: '+15551234567',
        relationship: 'child',
        relationshipOther: null,
        consentConfirmedAt: CONSENT_AT,
      },
    });
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('rejects invalid payloads before touching the auth provider', async () => {
    await expect(
      service.registerOnBehalf({ ...validBody, consentToActOnBehalf: false }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(createUser).not.toHaveBeenCalled();
    expect(usersService.createSeekerOnBehalfUser).not.toHaveBeenCalled();
  });

  it('removes the auth user again when the database write fails', async () => {
    usersService.createSeekerOnBehalfUser.mockRejectedValue(
      new Error('db down'),
    );

    await expect(service.registerOnBehalf(validBody)).rejects.toThrow(
      'db down',
    );
    expect(deleteUser).toHaveBeenCalledWith(AUTH_USER_ID);
  });

  it('maps a unique-constraint violation to 409 DUPLICATE_USER', async () => {
    usersService.createSeekerOnBehalfUser.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(service.registerOnBehalf(validBody)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(deleteUser).toHaveBeenCalledWith(AUTH_USER_ID);
  });

  it('still surfaces the original error when the rollback itself fails', async () => {
    usersService.createSeekerOnBehalfUser.mockRejectedValue(
      new Error('db down'),
    );
    deleteUser.mockRejectedValue(new Error('auth provider unavailable'));

    await expect(service.registerOnBehalf(validBody)).rejects.toThrow(
      'db down',
    );
  });
});
