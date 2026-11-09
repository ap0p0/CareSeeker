import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { RegistrantRepository } from './registrant.repository';
import { RegistrantService } from './registrant.service';

const USER_ID = '44444444-4444-4444-8444-444444444444';
const CONSENT_AT = new Date('2026-08-01T10:00:00.000Z');

const record = (overrides: Record<string, unknown> = {}) => ({
  name: 'Maria',
  surname: 'Lopez',
  email: 'maria@example.com',
  registrantsInfo: {
    phone: '+15551234567',
    relationship: 'CHILD',
    relationshipOther: null,
    consentConfirmedAt: CONSENT_AT,
    updatedAt: CONSENT_AT,
    ...overrides,
  },
});

describe('RegistrantService', () => {
  const repository = { findByUserId: jest.fn(), update: jest.fn() };
  let service: RegistrantService;

  beforeEach(() => {
    jest.clearAllMocks();
    repository.findByUserId.mockResolvedValue(record());
    service = new RegistrantService(
      repository as unknown as RegistrantRepository,
    );
  });

  it('returns identity and registrant details', async () => {
    await expect(service.get(USER_ID)).resolves.toEqual({
      name: 'Maria',
      surname: 'Lopez',
      email: 'maria@example.com',
      phone: '+15551234567',
      relationship: 'child',
      relationshipOther: null,
      consentConfirmedAt: CONSENT_AT,
      updatedAt: CONSENT_AT,
    });
  });

  it('404s for accounts registered for oneself', async () => {
    repository.findByUserId.mockResolvedValue(null);
    await expect(service.get(USER_ID)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      service.update(USER_ID, {
        name: 'A',
        surname: 'B',
        phone: '5551234567',
        relationship: 'child',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('validates and saves the editable details', async () => {
    repository.update.mockResolvedValue(
      record({ relationship: 'OTHER', relationshipOther: 'Neighbour' }),
    );

    const result = await service.update(USER_ID, {
      name: ' Maria ',
      surname: 'Lopez',
      phone: '(555) 123-4567',
      relationship: 'other',
      relationshipOther: 'Neighbour',
      // Ignored: credentials are account settings.
      email: 'other@example.com',
    });

    expect(repository.update).toHaveBeenCalledWith(USER_ID, {
      name: 'Maria',
      surname: 'Lopez',
      phone: '+15551234567',
      relationship: 'OTHER',
      relationshipOther: 'Neighbour',
    });
    expect(result.relationship).toBe('other');
    expect(result.relationshipOther).toBe('Neighbour');
  });

  it('rejects invalid updates before touching the database', async () => {
    await expect(
      service.update(USER_ID, { name: '', phone: 'nope' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.findByUserId).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });
});
