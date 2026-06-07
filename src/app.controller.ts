import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { ApiKeyGuard } from './common/guards/api-key.guard';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('ping')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Test API key auth and rate limiting' })
  @ApiSecurity('API_KEY')
  @ApiResponse({ status: 200, description: 'Pong with rate limit info' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({ status: 403, description: 'Rate limit exceeded' })
  ping(@Request() req) {
    return {
      message: 'pong',
      tenant: req.tenant.name,
      rateLimit: req.rateLimit,
    };
  }
}
