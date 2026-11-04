import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import type {
  AuthUserProvider,
  AuthUserRecord,
  CreateAuthUserInput,
  UpdateAuthUserInput,
} from './auth-user-provider';
import { getSupabaseAdminClient } from './supabase-admin';

/** Default adapter: Supabase Auth via the service (secret) key. */
export class SupabaseAuthUserProvider implements AuthUserProvider {
  async createUser(input: CreateAuthUserInput): Promise<AuthUserRecord> {
    const { data, error } =
      await getSupabaseAdminClient().auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
      });

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes('already') || message.includes('exists')) {
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

    return { id: authUser.id, email: authUser.email };
  }

  async deleteUser(id: string): Promise<void> {
    await getSupabaseAdminClient().auth.admin.deleteUser(id);
  }

  async updateUser(id: string, input: UpdateAuthUserInput): Promise<void> {
    const { error } = await getSupabaseAdminClient().auth.admin.updateUserById(
      id,
      { email: input.email, password: input.password },
    );

    if (error) {
      throw new BadRequestException({
        code: 'AUTH_UPDATE_FAILED',
        message: error.message,
      });
    }
  }
}
