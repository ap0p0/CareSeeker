import { ConflictException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';

/**
 * Accounts opened on behalf of someone else are identified by their
 * `registrants_info` row. The recipient-related registration steps (care
 * recipient, care preferences) only apply to them.
 */
export async function isOnBehalfAccount(
  prisma: PrismaService,
  userId: string,
): Promise<boolean> {
  const registrant = await prisma.registrantsInfo.findUnique({
    where: { userId },
    select: { id: true },
  });
  return registrant !== null;
}

export function notOnBehalfAccountError(what: string) {
  return new ConflictException({
    code: 'NOT_ON_BEHALF_ACCOUNT',
    message: `${what} only apply to accounts opened on behalf of someone else.`,
  });
}
