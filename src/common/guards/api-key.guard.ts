import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiKeyService } from '../../api-key/api-key.service';
import { RateLimitService } from '../../rate-limit/rate-limit.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private rateLimitService: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['x-api-key'];

    if (!key) throw new UnauthorizedException('API key missing');

    const apiKey = await this.apiKeyService.validateKey(key);
    if (!apiKey) throw new UnauthorizedException('Invalid or inactive API key');

    const { allowed, remaining, resetIn } =
      await this.rateLimitService.isAllowed(apiKey.tenantId);

    // attach to request for use in controllers
    request.tenant = apiKey.tenant;
    request.rateLimit = { remaining, resetIn };

    if (!allowed) {
      throw new ForbiddenException(
        `Rate limit exceeded. Try again in ${resetIn}s`,
      );
    }

    return true;
  }
}
