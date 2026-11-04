import { BadRequestException, ConflictException } from '@nestjs/common';
import type {
  AuthUserProvider,
  AuthUserRecord,
  CreateAuthUserInput,
  UpdateAuthUserInput,
} from '../auth-user-provider';
import {
  createLocalAuthUser,
  deleteLocalAuthUser,
  updateLocalAuthUser,
} from './local-auth.store';

/** Offline adapter backed by `.local/auth-users.json`. */
export class LocalAuthUserProvider implements AuthUserProvider {
  async createUser(input: CreateAuthUserInput): Promise<AuthUserRecord> {
    const user = createLocalAuthUser(input.email, input.password);

    if (!user) {
      throw new ConflictException({
        code: 'DUPLICATE_EMAIL',
        message: 'This email has already been registered',
      });
    }

    return { id: user.id, email: user.email };
  }

  async deleteUser(id: string): Promise<void> {
    deleteLocalAuthUser(id);
  }

  async updateUser(id: string, input: UpdateAuthUserInput): Promise<void> {
    const result = updateLocalAuthUser(id, input);

    if (!result.ok) {
      throw new BadRequestException({
        code: 'AUTH_UPDATE_FAILED',
        message:
          result.reason === 'DUPLICATE_EMAIL'
            ? 'This email is already in use'
            : 'Auth user not found',
      });
    }
  }
}
