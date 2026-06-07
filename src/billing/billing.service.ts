import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantPlan } from '../tenant/tenant.entity';
import { PLAN_LIMITS } from './billing.constants';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async checkAndIncrementQuota(tenantId: string): Promise<void> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) throw new ForbiddenException('Tenant not found');

    // reset monthly count if new billing cycle
    const now = new Date();
    if (!tenant.billingCycleStart) {
      tenant.billingCycleStart = now;
    }

    const cycleStart = new Date(tenant.billingCycleStart);
    const monthPassed =
      now.getMonth() !== cycleStart.getMonth() ||
      now.getFullYear() !== cycleStart.getFullYear();

    if (monthPassed) {
      tenant.monthlyRequestCount = 0;
      tenant.billingCycleStart = now;
    }

    const limit = PLAN_LIMITS[tenant.plan];

    if (tenant.monthlyRequestCount >= limit) {
      throw new ForbiddenException(
        `Monthly quota exceeded. You are on the ${tenant.plan} plan (${limit} requests/month). Please upgrade to Pro.`,
      );
    }

    tenant.monthlyRequestCount += 1;
    await this.tenantRepository.save(tenant);
  }

  async getQuotaStatus(tenantId: string) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) throw new ForbiddenException('Tenant not found');

    const limit = PLAN_LIMITS[tenant.plan];
    const used = tenant.monthlyRequestCount;
    const remaining = Math.max(0, limit - used);
    const percentUsed = Math.round((used / limit) * 100);

    return {
      plan: tenant.plan,
      limit,
      used,
      remaining,
      percentUsed,
      billingCycleStart: tenant.billingCycleStart,
    };
  }

  async upgradePlan(tenantId: string, plan: TenantPlan): Promise<void> {
    await this.tenantRepository.update(tenantId, { plan });
  }
}
