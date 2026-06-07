import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TenantPlan } from '../../tenant/tenant.entity';

export class UpgradePlanDto {
  @ApiProperty({ enum: TenantPlan, example: TenantPlan.PRO })
  @IsEnum(TenantPlan)
  plan!: TenantPlan;
}
