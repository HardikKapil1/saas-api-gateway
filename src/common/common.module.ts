import { Module } from '@nestjs/common';
import { ApiKeyModule } from '../api-key/api-key.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { UsageModule } from '../usage/usage.module';
import { BillingModule } from '../billing/billing.module';
import { ApiKeyGuard } from './guards/api-key.guard';

@Module({
  imports: [ApiKeyModule, RateLimitModule, UsageModule, BillingModule],
  providers: [ApiKeyGuard],
  exports: [ApiKeyGuard],
})
export class CommonModule {}
