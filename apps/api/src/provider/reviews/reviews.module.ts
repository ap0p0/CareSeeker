import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { ProviderRepository } from '../provider.repository';
import { ProviderReviewsController } from './reviews.controller';
import { ProviderReviewsRepository } from './reviews.repository';
import { ProviderReviewsService } from './reviews.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ProviderReviewsController],
  providers: [ProviderReviewsService, ProviderReviewsRepository, ProviderRepository],
})
export class ProviderReviewsModule {}
