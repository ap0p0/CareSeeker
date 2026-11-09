import { Injectable, NotFoundException } from '@nestjs/common';
import { RegistrantRepository } from './registrant.repository';
import type { RegistrantResponse } from './registrant.types';
import { validateUpdateRegistrantPayload } from './registrant.validation';

type RegistrantRecord = NonNullable<
  Awaited<ReturnType<RegistrantRepository['findByUserId']>>
>;

function toResponse(record: RegistrantRecord): RegistrantResponse {
  return {
    name: record.name,
    surname: record.surname,
    email: record.email,
    phone: record.registrantsInfo.phone,
    relationship: record.registrantsInfo.relationship.toLowerCase(),
    relationshipOther: record.registrantsInfo.relationshipOther,
    consentConfirmedAt: record.registrantsInfo.consentConfirmedAt,
    updatedAt: record.registrantsInfo.updatedAt,
  };
}

/**
 * Registrant of an account opened on behalf of someone else (step 1 of that
 * registration). Lets the registrant read and correct their details after
 * the account exists — e.g. when going back to step 1.
 */
@Injectable()
export class RegistrantService {
  constructor(private readonly registrantRepository: RegistrantRepository) {}

  private notFound() {
    return new NotFoundException({
      code: 'REGISTRANT_NOT_FOUND',
      message: 'This account was not opened on behalf of someone else.',
    });
  }

  async get(userId: string): Promise<RegistrantResponse> {
    const record = await this.registrantRepository.findByUserId(userId);
    if (!record) throw this.notFound();
    return toResponse(record);
  }

  async update(
    userId: string,
    rawPayload: unknown,
  ): Promise<RegistrantResponse> {
    const payload = validateUpdateRegistrantPayload(rawPayload);

    const existing = await this.registrantRepository.findByUserId(userId);
    if (!existing) throw this.notFound();

    return toResponse(await this.registrantRepository.update(userId, payload));
  }
}
