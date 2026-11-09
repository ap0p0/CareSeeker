import { ConflictException } from '@nestjs/common';
import type { CarePreferencesService } from '../care-preferences/care-preferences.service';
import type { CareRecipientService } from '../care-recipient/care-recipient.service';
import type { RegistrantRepository } from '../registrant/registrant.repository';
import type { RegistrantService } from '../registrant/registrant.service';
import type { SeekerOnboardingRepository } from './onboarding.repository';
import { SeekerOnboardingService } from './onboarding.service';

const USER_ID = '66666666-6666-4666-8666-666666666666';
const NOW = new Date('2026-08-05T10:00:00.000Z');

describe('SeekerOnboardingService', () => {
  const onboardingRepository = {
    getStatus: jest.fn(),
    markCompleted: jest.fn(),
    markConfirmed: jest.fn(),
  };
  const registrantRepository = { findByUserId: jest.fn() };
  const registrantService = { get: jest.fn() };
  const careRecipientService = { get: jest.fn() };
  const carePreferencesService = { get: jest.fn() };
  let service: SeekerOnboardingService;

  beforeEach(() => {
    jest.clearAllMocks();
    registrantRepository.findByUserId.mockResolvedValue({ name: 'Maria' });
    registrantService.get.mockResolvedValue({ name: 'Maria' });
    careRecipientService.get.mockResolvedValue({
      completed: true,
      careRecipient: { name: 'Rosa' },
    });
    carePreferencesService.get.mockResolvedValue({
      completed: true,
      preferences: { careFrequency: 'weekly' },
    });
    onboardingRepository.getStatus.mockResolvedValue({
      onboardingCompletedAt: null,
      profileConfirmedAt: null,
    });
    onboardingRepository.markCompleted.mockResolvedValue({
      onboardingCompletedAt: NOW,
    });
    onboardingRepository.markConfirmed.mockResolvedValue({
      profileConfirmedAt: NOW,
    });
    service = new SeekerOnboardingService(
      onboardingRepository as unknown as SeekerOnboardingRepository,
      registrantRepository as unknown as RegistrantRepository,
      registrantService as unknown as RegistrantService,
      careRecipientService as unknown as CareRecipientService,
      carePreferencesService as unknown as CarePreferencesService,
    );
  });

  it('returns everything saved for an on-behalf account', async () => {
    await expect(service.getStatus(USER_ID)).resolves.toEqual({
      careFor: 'other',
      registrant: { name: 'Maria' },
      careRecipient: { name: 'Rosa' },
      carePreferences: { careFrequency: 'weekly' },
      completedAt: null,
      profileConfirmedAt: null,
    });
  });

  it('reports self-registered accounts without loading on-behalf data', async () => {
    registrantRepository.findByUserId.mockResolvedValue(null);

    await expect(service.getStatus(USER_ID)).resolves.toEqual({
      careFor: 'self',
      registrant: null,
      careRecipient: null,
      carePreferences: null,
      completedAt: null,
      profileConfirmedAt: null,
    });
    expect(careRecipientService.get).not.toHaveBeenCalled();
    await expect(service.complete(USER_ID)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('completes once every step is saved, idempotently', async () => {
    await expect(service.complete(USER_ID)).resolves.toMatchObject({
      completedAt: NOW,
    });
    expect(onboardingRepository.markCompleted).toHaveBeenCalledWith(
      USER_ID,
      expect.any(Date),
    );

    onboardingRepository.getStatus.mockResolvedValue({
      onboardingCompletedAt: NOW,
      profileConfirmedAt: null,
    });
    onboardingRepository.markCompleted.mockClear();
    await service.complete(USER_ID);
    expect(onboardingRepository.markCompleted).not.toHaveBeenCalled();
  });

  it('refuses to complete with a missing step', async () => {
    carePreferencesService.get.mockResolvedValue({
      completed: false,
      preferences: null,
    });
    await expect(service.complete(USER_ID)).rejects.toMatchObject({
      response: { code: 'ONBOARDING_INCOMPLETE' },
    });
    expect(onboardingRepository.markCompleted).not.toHaveBeenCalled();
  });

  it('confirms only a completed registration', async () => {
    await expect(service.confirm(USER_ID)).rejects.toMatchObject({
      response: { code: 'ONBOARDING_INCOMPLETE' },
    });

    onboardingRepository.getStatus.mockResolvedValue({
      onboardingCompletedAt: NOW,
      profileConfirmedAt: null,
    });
    await expect(service.confirm(USER_ID)).resolves.toMatchObject({
      profileConfirmedAt: NOW,
    });
  });
});
