import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { getSupabaseAdminClient } from '../auth/supabase-admin';
import { UsersService } from '../users/users.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegisterProviderPayload = {
  email: string;
  password: string;
};

@Injectable()
export class ProviderService {
  constructor(private readonly usersService: UsersService) {}

  async register(rawPayload: unknown) {
    const payload = this.validateRegisterPayload(rawPayload);
    const supabaseAdmin = getSupabaseAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
    });

    if (error) {
      if (
        error.message.toLowerCase().includes('already') ||
        error.message.toLowerCase().includes('exists')
      ) {
        throw new ConflictException({
          code: 'DUPLICATE_EMAIL',
          message: 'This email has already been registered',
        });
      }

      throw new BadRequestException({
        code: 'AUTH_SIGNUP_FAILED',
        message: error.message,
      });
    }

    const authUser = data.user;

    if (!authUser?.id || !authUser.email) {
      throw new InternalServerErrorException({
        code: 'AUTH_USER_CREATION_FAILED',
        message: 'Supabase did not return a valid user record.',
      });
    }

    try {
      const appUser = await this.usersService.createDefaultProviderUser(
        authUser.id,
        authUser.email,
      );

      return {
        id: appUser.id,
        email: appUser.email,
        role: appUser.role.toLowerCase(),
        providerVerificationStatus:
          appUser.providerVerificationStatus?.toLowerCase() ?? null,
      };
    } catch (error: unknown) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.id);

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

  private validateRegisterPayload(payload: unknown): RegisterProviderPayload {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const body = payload as Record<string, unknown>;
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password =
      typeof body.password === 'string' ? body.password.trim() : '';

    const errors: string[] = [];

    if (!email) {
      errors.push('email is required');
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push('email must be a valid email address');
    }

    if (!password) {
      errors.push('password is required');
    } else if (password.length < 6) {
      errors.push('password must be at least 6 characters');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid provider registration payload',
        errors,
      });
    }

    return { email, password };
  }
}
