import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiKeyService } from '../../api-key/api-key.service';
import { RateLimitService } from '../../rate-limit/rate-limit.service';
import { UsageService } from '../../usage/usage.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private rateLimitService: RateLimitService,
    private usageService: UsageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const key = request.headers['x-api-key'];
    const startTime = Date.now();

    if (!key) throw new UnauthorizedException('API key missing');

    const apiKey = await this.apiKeyService.validateKey(key);
    if (!apiKey) throw new UnauthorizedException('Invalid or inactive API key');

    const { allowed, remaining, resetIn } =
      await this.rateLimitService.isAllowed(apiKey.tenantId);

    request.tenant = apiKey.tenant;
    request.apiKeyId = apiKey.id;
    request.rateLimit = { remaining, resetIn };
    request.startTime = startTime;

    // log after response finishes
    response.on('finish', () => {
      this.usageService.log({
        tenantId: apiKey.tenantId,
        method: request.method,
        endpoint: request.route?.path || request.url,
        statusCode: response.statusCode,
        responseTimeMs: Date.now() - startTime,
        apiKeyId: apiKey.id,
      });
    });

    if (!allowed) {
      throw new ForbiddenException(
        `Rate limit exceeded. Try again in ${resetIn}s`,
      );
    }

    return true;
  }
}