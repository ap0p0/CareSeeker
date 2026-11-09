import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CareRecipientController } from './care-recipient.controller';
import { CareRecipientRepository } from './care-recipient.repository';
import { CareRecipientService } from './care-recipient.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [CareRecipientController],
  providers: [CareRecipientService, CareRecipientRepository],
  exports: [CareRecipientService],
})
export class CareRecipientModule {}
