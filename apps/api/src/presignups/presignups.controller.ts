import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PresignupsService } from './presignups.service';

@Controller('presignups')
export class PresignupsController {
  constructor(private readonly presignupsService: PresignupsService) {}

  @Post('seeker')
  @HttpCode(HttpStatus.CREATED)
  async createSeekerPresignup(@Body() body: unknown) {
    const presignup = await this.presignupsService.createSeeker(body);

    return {
      success: true,
      message: 'Care seeker presignup submitted successfully',
      data: presignup,
    };
  }

  @Post('provider')
  @HttpCode(HttpStatus.CREATED)
  async createProviderPresignup(@Body() body: unknown) {
    const presignup = await this.presignupsService.createProvider(body);

    return {
      success: true,
      message: 'Care provider presignup submitted successfully',
      data: presignup,
    };
  }
}
