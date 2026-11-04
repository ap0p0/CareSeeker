import '../../load-env';
import { UserRole } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';
import { isLocalAuthMode } from '../auth-mode';
import { createLocalAuthUser, normalizeEmail } from './local-auth.store';

/**
 * Dev helper for `AUTH_MODE=local`: creates a local auth credential plus the
 * matching `users` row (any role, including admin which is never
 * self-assignable through the API).
 *
 *   pnpm local-auth:create-user -- --email admin@local.test --password secret123 --role admin
 */
function readArg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  if (!isLocalAuthMode()) {
    throw new Error('Set AUTH_MODE=local before running this script.');
  }

  const email = readArg('email');
  const password = readArg('password');
  const roleArg = (readArg('role') ?? 'seeker').toUpperCase();
  const name = readArg('name') ?? 'Local';
  const surname = readArg('surname') ?? 'User';

  if (!email || !password) {
    throw new Error(
      'Usage: --email <email> --password <password> [--role seeker|provider|admin] [--name] [--surname]',
    );
  }

  if (!(roleArg in UserRole)) {
    throw new Error(
      `Unknown role "${roleArg}". Use seeker, provider or admin.`,
    );
  }

  const role = UserRole[roleArg as keyof typeof UserRole];
  const authUser = createLocalAuthUser(email, password);
  if (!authUser) {
    throw new Error(
      `A local auth user with email ${normalizeEmail(email)} already exists.`,
    );
  }

  const prisma = new PrismaService();
  await prisma.$connect();

  try {
    const user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email,
        name,
        surname,
        role,
        providerVerificationStatus:
          role === UserRole.PROVIDER ? 'PENDING' : null,
      },
    });

    console.log(
      `Created ${user.role.toLowerCase()} ${user.email} (${user.id})`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
