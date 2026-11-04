import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import {
  AUTH_USER_PROVIDER,
  type AuthUserProvider,
} from '../auth/auth-user-provider';
import { UsersService } from '../users/users.service';
import {
  parseAddress,
  parseDateOfBirth,
  parseGender,
  parseName,
  parsePhone,
} from './common/personal-info.validation';
import { ProviderProfileImageStorageService } from './common/profile-image-storage.service';
import {
  requireValidProfileImage,
  type UploadedFile,
} from './common/uploaded-file';
import type {
  RegisterProviderPayload,
  RegisterProviderResponse,
} from './provider.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly profileImageStorage: ProviderProfileImageStorageService,
    @Inject(AUTH_USER_PROVIDER) private readonly authUsers: AuthUserProvider,
  ) {}

  /**
   * Onboarding step 1: creates the auth user, stores the profile picture in
   * private storage and writes `users` + `providers_info` in one transaction.
   * Any failure after the auth user exists rolls everything back so a provider
   * can never be left with credentials but no profile.
   */
  async register(
    rawPayload: unknown,
    profilePicture: UploadedFile | undefined,
  ): Promise<RegisterProviderResponse> {
    const payload = this.validateRegisterPayload(rawPayload);
    const picture = requireValidProfileImage(profilePicture);

    const authUser = await this.authUsers.createUser({
      email: payload.email,
      password: payload.password,
    });

    let profileImagePath: string | null = null;

    try {
      profileImagePath = await this.profileImageStorage.upload(
        authUser.id,
        picture,
      );

      const appUser = await this.usersService.createProviderUser(
        authUser.id,
        authUser.email,
        {
          name: payload.name,
          surname: payload.surname,
          personalInfo: {
            dateOfBirth: payload.dateOfBirth,
            gender: payload.gender,
            phone: payload.phone,
            addressLine1: payload.addressLine1,
            city: payload.city,
            state: payload.state,
            postalCode: payload.postalCode,
            profileImagePath,
          },
        },
      );

      return {
        id: appUser.id,
        email: appUser.email,
        name: appUser.name,
        surname: appUser.surname,
        role: appUser.role.toLowerCase(),
        providerVerificationStatus:
          appUser.providerVerificationStatus?.toLowerCase() ?? null,
      };
    } catch (error: unknown) {
      await this.rollbackRegistration(authUser.id, profileImagePath);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          code: 'DUPLICATE_USER',
          message: 'This user already exists.',
        });
      }

      throw error;
    }
  }

  private async rollbackRegistration(
    authUserId: string,
    profileImagePath: string | null,
  ) {
    await this.profileImageStorage.remove(profileImagePath);

    try {
      await this.authUsers.deleteUser(authUserId);
    } catch (error) {
      this.logger.error(
        `Could not roll back auth user ${authUserId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private validateRegisterPayload(payload: unknown): RegisterProviderPayload {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const body = payload as Record<string, unknown>;
    const errors: string[] = [];

    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const confirmPassword =
      typeof body.confirmPassword === 'string' ? body.confirmPassword : null;

    if (!email) {
      errors.push('email is required');
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push('email must be a valid email address');
    }

    if (!password) {
      errors.push('password is required');
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      errors.push(
        `password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      );
    }

    // `confirmPassword` is optional on the wire (the frontend already compares
    // both), but when present it must match so API clients get the same rule.
    if (confirmPassword !== null && confirmPassword !== password) {
      errors.push('confirmPassword must match password');
    }

    const name = parseName(body.name, 'name', errors);
    const surname = parseName(body.surname, 'surname', errors);
    const dateOfBirth = parseDateOfBirth(body.dateOfBirth, errors);
    const gender = parseGender(body.gender, errors);
    const phone = parsePhone(body.phone, errors);
    const address = parseAddress(body, errors);

    if (
      errors.length > 0 ||
      !name ||
      !surname ||
      !dateOfBirth ||
      !phone ||
      !address
    ) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid provider registration payload',
        errors,
      });
    }

    return {
      email,
      password,
      name,
      surname,
      dateOfBirth,
      gender,
      phone,
      ...address,
    };
  }
}
