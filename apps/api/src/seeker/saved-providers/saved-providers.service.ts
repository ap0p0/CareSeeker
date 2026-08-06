import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { isUuid, lowerCaseEnum } from '../seeker.validation';
import { SavedProvidersRepository } from './saved-providers.repository';

@Injectable()
export class SavedProvidersService {
  constructor(
    private readonly savedProvidersRepository: SavedProvidersRepository,
  ) {}

  async saveProvider(seekerId: string, providerId: string) {
    this.ensureUuid(providerId, 'providerId');

    const provider =
      await this.savedProvidersRepository.findApprovedProvider(providerId);
    if (!provider) {
      throw new NotFoundException({
        code: 'PROVIDER_NOT_FOUND',
        message: 'Approved provider not found',
      });
    }

    try {
      const saved = await this.savedProvidersRepository.saveProvider(
        seekerId,
        providerId,
      );

      return this.serializeSavedProvider(saved);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          code: 'PROVIDER_ALREADY_SAVED',
          message: 'Provider is already saved',
        });
      }

      throw error;
    }
  }

  async removeSavedProvider(seekerId: string, providerId: string) {
    this.ensureUuid(providerId, 'providerId');

    const result = await this.savedProvidersRepository.removeSavedProvider(
      seekerId,
      providerId,
    );

    if (result.count === 0) {
      throw new NotFoundException({
        code: 'SAVED_PROVIDER_NOT_FOUND',
        message: 'Saved provider not found',
      });
    }
  }

  async listSavedProviders(seekerId: string) {
    const savedProviders =
      await this.savedProvidersRepository.listSavedProviders(seekerId);

    return savedProviders.map((savedProvider) =>
      this.serializeSavedProvider(savedProvider),
    );
  }

  private ensureUuid(value: string, field: string) {
    if (!isUuid(value)) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `${field} must be a valid UUID`,
      });
    }
  }

  private serializeSavedProvider(savedProvider: {
    id: string;
    createdAt: Date;
    provider: {
      id: string;
      name: string;
      surname: string;
      providerVerificationStatus: string | null;
    };
  }) {
    return {
      id: savedProvider.id,
      createdAt: savedProvider.createdAt,
      provider: {
        id: savedProvider.provider.id,
        name: savedProvider.provider.name,
        surname: savedProvider.provider.surname,
        providerVerificationStatus: lowerCaseEnum(
          savedProvider.provider.providerVerificationStatus,
        ),
      },
    };
  }
}
