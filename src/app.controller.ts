import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiKeyGuard } from './common/guards/api-key.guard';

@Controller()
export class AppController {
  @Get('ping')
  @UseGuards(ApiKeyGuard)
  ping(@Request() req) {
    return {
      message: 'pong',
      tenant: req.tenant.name,
      rateLimit: req.rateLimit,
    };
  }
}