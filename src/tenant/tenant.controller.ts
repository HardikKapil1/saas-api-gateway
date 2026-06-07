import { Controller, Post, Body } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post('register')
  async register(@Body() dto: CreateTenantDto) {
    const tenant = await this.tenantService.create(dto);
    const { password, ...result } = tenant;
    return result;
  }
}
