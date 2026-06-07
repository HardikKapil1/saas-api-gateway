import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { UpgradePlanDto } from './dto/upgrade-plan.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantPlan } from '../tenant/tenant.entity';

@ApiTags('Billing')
@ApiBearerAuth('JWT')
@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('quota')
  @ApiOperation({ summary: 'Get current quota status' })
  @ApiResponse({ status: 200, description: 'Quota status' })
  getQuota(@Request() req) {
    return this.billingService.getQuotaStatus(req.user.id);
  }

  @Patch('upgrade')
  @ApiOperation({ summary: 'Upgrade or downgrade plan' })
  @ApiResponse({ status: 200, description: 'Plan updated' })
  async upgradePlan(@Request() req, @Body() dto: UpgradePlanDto) {
    await this.billingService.upgradePlan(req.user.id, dto.plan);
    return { message: `Plan updated to ${dto.plan}` };
  }
}
