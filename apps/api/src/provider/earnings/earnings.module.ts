import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { ProviderRepository } from '../provider.repository';
import { ProviderEarningsController } from './earnings.controller';
import { ProviderEarningsRepository } from './earnings.repository';
import { ProviderEarningsService } from './earnings.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ProviderEarningsController],
  providers: [
    ProviderEarningsService,
    ProviderEarningsRepository,
    ProviderRepository,
  ],
})
export class ProviderEarningsModule {}
