import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import * as bcrypt from 'bcrypt';

type MysqlDriverError = {
  code?: string;
  errno?: number;
  message?: string;
};

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.tenantRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const tenant = this.tenantRepository.create({
      ...dto,
      password: hashed,
    });

    try {
      return await this.tenantRepository.save(tenant);
    } catch (error) {
      const driverError = (error as { driverError?: MysqlDriverError })
        .driverError;

      if (driverError?.code === 'ER_DUP_ENTRY' || driverError?.errno === 1062) {
        const message = driverError.message ?? '';

        if (message.includes('tenants.IDX_32731f181236a46182a38c992a')) {
          throw new ConflictException('Tenant name already registered');
        }

        if (message.includes('email')) {
          throw new ConflictException('Email already registered');
        }

        throw new ConflictException('Tenant already exists');
      }

      throw error;
    }
  }

  async findByEmail(email: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { id } });
  }
}
