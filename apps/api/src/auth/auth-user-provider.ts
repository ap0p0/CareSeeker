/**
 * Abstraction over the identity provider that owns credentials.
 *
 * The application `users` row is always created by this API; the adapter only
 * creates / updates / deletes the *auth* identity and returns its id, which
 * becomes `users.id`.
 */
export type CreateAuthUserInput = {
  email: string;
  password: string;
};

export type AuthUserRecord = {
  id: string;
  email: string;
};

export type UpdateAuthUserInput = {
  email?: string;
  password?: string;
};

export interface AuthUserProvider {
  /**
   * Creates the auth identity. Throws `ConflictException` (`DUPLICATE_EMAIL`)
   * when the email is taken and `BadRequestException` (`AUTH_SIGNUP_FAILED`)
   * for any other provider error.
   */
  createUser(input: CreateAuthUserInput): Promise<AuthUserRecord>;

  /** Best-effort removal (used to roll back a failed registration). */
  deleteUser(id: string): Promise<void>;

  /** Throws `BadRequestException` (`AUTH_UPDATE_FAILED`) on provider errors. */
  updateUser(id: string, input: UpdateAuthUserInput): Promise<void>;
}

export const AUTH_USER_PROVIDER = Symbol('AUTH_USER_PROVIDER');
