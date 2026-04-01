import { Module } from '@nestjs/common';
import { AdminController } from './admin/admin.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PresignupsModule } from './presignups/presignups.module';
import { SeekerController } from './seeker/seeker.controller';
import { SeekerService } from './seeker/seeker.service';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, PresignupsModule],
  controllers: [AppController, AdminController, SeekerController],
  providers: [AppService, SeekerService],
})
export class AppModule {}
