import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { ApiKeyModule } from './api-key/api-key.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { ApiKeyService } from './api-key/api-key.service';
import { RateLimitService } from './rate-limit/rate-limit.service';

@Controller()
export class AppController {
  constructor(
    private apiKeyService: ApiKeyService,
    private rateLimitService: RateLimitService,
  ) {}

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
