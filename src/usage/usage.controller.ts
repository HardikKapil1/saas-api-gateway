import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiQuery,
} from '@nestjs/swagger';
import { UsageService } from './usage.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Usage')
@ApiBearerAuth('JWT')
@Controller('usage')
@UseGuards(JwtAuthGuard)
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get usage stats for tenant' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days (default 7)' })
  @ApiResponse({ status: 200, description: 'Usage statistics' })
  getStats(@Request() req, @Query('days') days: string) {
    return this.usageService.getStats(req.user.id, days ? +days : 7);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get recent request logs' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of logs (default 20)' })
  @ApiResponse({ status: 200, description: 'Recent logs' })
  getLogs(@Request() req, @Query('limit') limit: string) {
    return this.usageService.getRecentLogs(req.user.id, limit ? +limit : 20);
  }
}