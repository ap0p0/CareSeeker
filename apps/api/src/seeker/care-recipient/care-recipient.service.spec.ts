import { BadRequestException, ConflictException } from '@nestjs/common';
import type { CareRecipientRepository } from './care-recipient.repository';
import { CareRecipientService } from './care-recipient.service';

const USER_ID = '33333333-3333-4333-8333-333333333333';
const UPDATED_AT = new Date('2026-08-02T10:00:00.000Z');

const storedRecipient = {
  careRecipient: {
    id: 'recipient-id',
    userId: USER_ID,
    name: 'Rosa',
    surname: 'Lopez',
    dateOfBirth: new Date('1941-03-09T00:00:00.000Z'),
    gender: 'FEMALE',
    addressLine1: '12 Oak St',
    city: 'Austin',
    state: 'TX',
    postalCode: '78701',
    createdAt: UPDATED_AT,
    updatedAt: UPDATED_AT,
  },
  careProfile: {
    livingSituation: 'LIVE_ALONE',
    mobilityLevel: 'WALKING_AID',
    languagesSpoken: ['SPANISH'],
    otherLanguage: null,
    ethnicBackground: 'LATINO',
    additionalInfo: null,
  },
};

const expectedResponse = {
  name: 'Rosa',
  surname: 'Lopez',
  dateOfBirth: '1941-03-09',
  gender: 'female',
  addressLine1: '12 Oak St',
  city: 'Austin',
  state: 'TX',
  postalCode: '78701',
  livingSituation: 'live_alone',
  mobilityLevel: 'walking_aid',
  languagesSpoken: ['spanish'],
  otherLanguage: null,
  ethnicBackground: 'latino',
  additionalInfo: null,
  updatedAt: UPDATED_AT,
};

const validBody = {
  name: 'Rosa',
  surname: 'Lopez',
  dateOfBirth: '1941-03-09',
  gender: 'female',
  addressLine1: '12 Oak St',
  city: 'Austin',
  state: 'TX',
  postalCode: '78701',
  livingSituation: 'live_alone',
  mobilityLevel: 'walking_aid',
  languagesSpoken: ['spanish'],
  ethnicBackground: 'latino',
};

describe('CareRecipientService', () => {
  const repository = {
    isOnBehalfAccount: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };
  let service: CareRecipientService;

  beforeEach(() => {
    jest.clearAllMocks();
    repository.isOnBehalfAccount.mockResolvedValue(true);
    repository.find.mockResolvedValue(storedRecipient);
    repository.save.mockResolvedValue(storedRecipient);
    service = new CareRecipientService(
      repository as unknown as CareRecipientRepository,
    );
  });

  it('returns the saved care recipient as completed', async () => {
    await expect(service.get(USER_ID)).resolves.toEqual({
      completed: true,
      careRecipient: expectedResponse,
    });
  });

  it('reports an unsaved step as not completed', async () => {
    repository.find.mockResolvedValue({
      careRecipient: null,
      careProfile: { ...storedRecipient.careProfile, livingSituation: null },
    });

    await expect(service.get(USER_ID)).resolves.toEqual({
      completed: false,
      careRecipient: null,
    });
  });

  it('validates and saves step 2', async () => {
    await expect(service.save(USER_ID, validBody)).resolves.toEqual({
      completed: true,
      careRecipient: expectedResponse,
    });

    expect(repository.save).toHaveBeenCalledWith(
      USER_ID,
      expect.objectContaining({
        name: 'Rosa',
        gender: 'FEMALE',
        dateOfBirth: new Date('1941-03-09T00:00:00.000Z'),
      }),
    );
  });

  it('does not save invalid payloads', async () => {
    await expect(
      service.save(USER_ID, { ...validBody, mobilityLevel: '' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('rejects accounts registered for oneself', async () => {
    repository.isOnBehalfAccount.mockResolvedValue(false);

    await expect(service.get(USER_ID)).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(service.save(USER_ID, validBody)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repository.save).not.toHaveBeenCalled();
  });
});
