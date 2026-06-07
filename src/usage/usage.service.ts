import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UsageLog } from './usage.entity';

@Injectable()
export class UsageService {
  constructor(
    @InjectRepository(UsageLog)
    private usageRepository: Repository<UsageLog>,
  ) {}

  async log(data: {
    tenantId: string;
    method: string;
    endpoint: string;
    statusCode: number;
    responseTimeMs: number;
    apiKeyId: string;
  }): Promise<void> {
    const log = this.usageRepository.create(data);
    await this.usageRepository.save(log);
  }

  async getStats(tenantId: string, days: number = 7) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const logs = await this.usageRepository.find({
      where: {
        tenantId,
        createdAt: Between(from, new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    const totalRequests = logs.length;
    const successCount = logs.filter((l) => l.statusCode < 400).length;
    const errorCount = logs.filter((l) => l.statusCode >= 400).length;
    const avgResponseTime =
      totalRequests > 0
        ? Math.round(
            logs.reduce((sum, l) => sum + l.responseTimeMs, 0) / totalRequests,
          )
        : 0;

    // requests per endpoint
    const endpointMap: Record<string, number> = {};
    for (const log of logs) {
      const key = `${log.method} ${log.endpoint}`;
      endpointMap[key] = (endpointMap[key] || 0) + 1;
    }

    // requests per day
    const dailyMap: Record<string, number> = {};
    for (const log of logs) {
      const day = log.createdAt.toISOString().split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    }

    return {
      period: `Last ${days} days`,
      totalRequests,
      successCount,
      errorCount,
      avgResponseTimeMs: avgResponseTime,
      topEndpoints: Object.entries(endpointMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([endpoint, count]) => ({ endpoint, count })),
      dailyBreakdown: Object.entries(dailyMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count })),
    };
  }

  async getRecentLogs(tenantId: string, limit: number = 20) {
    return this.usageRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
