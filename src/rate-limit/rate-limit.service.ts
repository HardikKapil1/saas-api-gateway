import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimitService {
  private redis: Redis;

  constructor(private config: ConfigService) {
    this.redis = new Redis({
      host: this.config.get('REDIS_HOST'),
      port: +this.config.get('REDIS_PORT'),
    });
  }

  async isAllowed(
    tenantId: string,
    limit: number = 60,
    windowSeconds: number = 60,
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const key = `rate_limit:${tenantId}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, windowSeconds);
    }

    const ttl = await this.redis.ttl(key);
    const remaining = Math.max(0, limit - current);
    const allowed = current <= limit;

    return { allowed, remaining, resetIn: ttl };
  }
}