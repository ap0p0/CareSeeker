import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import type { AuthRequest } from '../../auth/auth-types';
import { requireSeekerUser } from '../require-seeker';
import { MessagesService } from './messages.service';

@Controller('seeker/messages')
@UseGuards(SupabaseJwtGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMessage(@Req() req: AuthRequest, @Body() body: unknown) {
    const seekerId = requireSeekerUser(req);
    const message = await this.messagesService.createMessage(seekerId, body);

    return {
      success: true,
      message: 'Message created successfully',
      data: message,
    };
  }

  @Get('conversations')
  async listConversations(@Req() req: AuthRequest) {
    const seekerId = requireSeekerUser(req);
    return this.messagesService.listConversations(seekerId);
  }

  @Get(':otherUserId')
  async getMessages(
    @Req() req: AuthRequest,
    @Param('otherUserId') otherUserId: string,
  ) {
    const seekerId = requireSeekerUser(req);
    return this.messagesService.getMessages(seekerId, otherUserId);
  }

  @Delete(':messageId')
  async deleteMessage(
    @Req() req: AuthRequest,
    @Param('messageId') messageId: string,
  ) {
    const seekerId = requireSeekerUser(req);
    const message = await this.messagesService.deleteMessage(
      seekerId,
      messageId,
    );

    return {
      success: true,
      message: 'Message deleted successfully',
      data: message,
    };
  }
}
