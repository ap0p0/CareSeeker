import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { getSupabaseAdminClient } from '../auth/supabase-admin';
import { UsersService } from '../users/users.service';
import { SeekerRepository } from './seeker.repository';
import {
  ensureObject,
  lowerCaseEnum,
  readOptionalString,
} from './seeker.validation';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegisterSeekerPayload = {
  email: string;
  password: string;
};

@Injectable()
export class SeekerService {
  constructor(
    private readonly usersService: UsersService,
    private readonly seekerRepository: SeekerRepository,
  ) {}

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
      const appUser = await this.usersService.createDefaultSeekerUser(
        authUser.id,
        authUser.email,
      );

      return {
        id: appUser.id,
        email: appUser.email,
        role: appUser.role.toLowerCase(),
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

  async getOverview(userId: string) {
    const overview = await this.seekerRepository.getOverview(userId);
    const recentActivity = [
      ...overview.recentJobs.map((job) => ({
        id: job.id,
        type: 'job',
        label: job.title,
        status: lowerCaseEnum(job.status),
        createdAt: job.updatedAt,
      })),
      ...overview.recentNotifications.map((notification) => ({
        id: notification.id,
        type: 'notification',
        label: notification.title,
        status: lowerCaseEnum(notification.type),
        createdAt: notification.createdAt,
      })),
      ...overview.recentMessages.map((message) => ({
        id: message.id,
        type: 'message',
        label: message.body.slice(0, 80),
        status: 'received',
        createdAt: message.createdAt,
      })),
      ...overview.recentPayments.map((payment) => ({
        id: payment.id,
        type: 'payment',
        label: `${payment.amountCents} cents`,
        status: lowerCaseEnum(payment.status),
        createdAt: payment.createdAt,
      })),
    ]
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, 10);

    return {
      activeJobs: overview.activeJobs,
      savedProvidersCount: overview.savedProvidersCount,
      notificationsCount: overview.notificationsCount,
      recentActivity,
    };
  }

  async listHistory(userId: string) {
    const history = await this.seekerRepository.listHistory(userId);

    return history.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      scheduledAt: job.scheduledAt,
      hourlyRateCents: job.hourlyRateCents,
      status: job.deletedAt ? 'deleted' : lowerCaseEnum(job.status),
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      deletedAt: job.deletedAt,
    }));
  }

  async listExploreProviders(query: Record<string, unknown>) {
    const search =
      typeof query.q === 'string' && query.q.trim().length > 0
        ? query.q.trim()
        : undefined;

    const providers = await this.seekerRepository.listExploreProviders(search);

    return providers.map((provider) => ({
      id: provider.id,
      username: provider.username,
      name: provider.name,
      surname: provider.surname,
      providerVerificationStatus: lowerCaseEnum(
        provider.providerVerificationStatus,
      ),
    }));
  }

  async getAccount(userId: string) {
    const account = await this.seekerRepository.getAccount(userId);
    if (!account) {
      throw new NotFoundException({
        code: 'SEEKER_NOT_FOUND',
        message: 'Care seeker account not found',
      });
    }

    return {
      ...account,
      role: lowerCaseEnum(account.role),
    };
  }

  async updateAccount(userId: string, rawPayload: unknown) {
    const payload = this.validateAccountUpdatePayload(rawPayload);

    try {
      const account = await this.seekerRepository.updateAccount(userId, payload);
      return {
        ...account,
        role: lowerCaseEnum(account.role),
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          code: 'DUPLICATE_USERNAME',
          message: 'This username is already in use',
        });
      }

      throw error;
    }
  }

  private validateRegisterPayload(payload: unknown): RegisterSeekerPayload {
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
        message: 'Invalid seeker registration payload',
        errors,
      });
    }

    return { email, password };
  }

  private validateAccountUpdatePayload(payload: unknown) {
    const body = ensureObject(payload);
    if (!body) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const errors: string[] = [];
    const name = readOptionalString(body, 'name', errors);
    const surname = readOptionalString(body, 'surname', errors);
    const username = readOptionalString(body, 'username', errors);

    if (
      typeof name === 'undefined' &&
      typeof surname === 'undefined' &&
      typeof username === 'undefined'
    ) {
      errors.push('At least one field must be provided');
    }

    if (typeof username === 'string' && !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      errors.push('username must be 3-30 characters and use only letters, numbers, and underscores');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid account update payload',
        errors,
      });
    }

    return {
      ...(typeof name !== 'undefined' ? { name } : {}),
      ...(typeof surname !== 'undefined' ? { surname } : {}),
      ...(typeof username !== 'undefined' ? { username } : {}),
    };
  }
}
