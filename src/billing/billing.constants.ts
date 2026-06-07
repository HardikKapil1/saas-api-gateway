import { TenantPlan } from '../tenant/tenant.entity';

export const PLAN_LIMITS: Record<TenantPlan, number> = {
  [TenantPlan.FREE]: 1000,
  [TenantPlan.PRO]: 50000,
  [TenantPlan.ENTERPRISE]: 1000000,
};
