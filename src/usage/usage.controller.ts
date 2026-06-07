import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { UsageService } from './usage.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('usage')
@UseGuards(JwtAuthGuard)
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get('stats')
  getStats(@Request() req, @Query('days') days: string) {
    return this.usageService.getStats(req.user.id, days ? +days : 7);
  }

  @Get('logs')
  getLogs(@Request() req, @Query('limit') limit: string) {
    return this.usageService.getRecentLogs(req.user.id, limit ? +limit : 20);
  }
}