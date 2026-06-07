import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantService } from '../tenant/tenant.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private tenantService: TenantService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const tenant = await this.tenantService.findByEmail(dto.email);
    if (!tenant) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, tenant.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: tenant.id, email: tenant.email };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
      },
    };
  }
}