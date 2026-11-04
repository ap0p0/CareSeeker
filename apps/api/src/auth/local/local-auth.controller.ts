import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  findLocalAuthUserByEmail,
  verifyLocalAuthPassword,
} from './local-auth.store';
import {
  LOCAL_AUTH_TOKEN_TTL_SECONDS,
  signLocalAccessToken,
} from './local-auth.tokens';

/**
 * Password sign-in for `AUTH_MODE=local`. Only registered in that mode; the
 * response mirrors the subset of a Supabase session the web app relies on.
 */
@Controller('local-auth')
export class LocalAuthController {
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() body: unknown) {
    const { email, password } = this.readCredentials(body);
    const user = findLocalAuthUserByEmail(email);

    if (!user || !verifyLocalAuthPassword(user, password)) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid login credentials',
      });
    }

    const { accessToken, expiresAt } = await signLocalAccessToken(user);

    return {
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: LOCAL_AUTH_TOKEN_TTL_SECONDS,
      expires_at: expiresAt,
      user: { id: user.id, email: user.email },
    };
  }

  private readCredentials(body: unknown): { email: string; password: string } {
    const record =
      body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
    const email = typeof record.email === 'string' ? record.email.trim() : '';
    const password = typeof record.password === 'string' ? record.password : '';

    if (!email || !password) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Email and password are required',
      });
    }

    return { email, password };
  }
}
