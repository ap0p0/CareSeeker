import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { ProviderRepository } from '../provider.repository';
import { ProviderVerificationController } from './verification.controller';
import { ProviderVerificationRepository } from './verification.repository';
import { ProviderVerificationService } from './verification.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ProviderVerificationController],
  providers: [
    ProviderVerificationService,
    ProviderVerificationRepository,
    ProviderRepository,
  ],
})
export class ProviderVerificationModule {}
