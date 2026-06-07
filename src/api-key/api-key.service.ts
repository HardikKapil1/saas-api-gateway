import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async create(tenantId: string, dto: CreateApiKeyDto): Promise<ApiKey> {
    const key = `sk_${randomBytes(32).toString('hex')}`;

    const apiKey = this.apiKeyRepository.create({
      key,
      name: dto.name,
      tenantId,
    });

    return this.apiKeyRepository.save(apiKey);
  }

  async findAllByTenant(tenantId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({ where: { tenantId } });
  }

  async revoke(id: string, tenantId: string): Promise<void> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id, tenantId },
    });

    if (!apiKey) throw new NotFoundException('API key not found');

    apiKey.isActive = false;
    await this.apiKeyRepository.save(apiKey);
  }

  async validateKey(key: string): Promise<ApiKey | null> {
    return this.apiKeyRepository.findOne({
      where: { key, isActive: true },
      relations: {tenant: true},
    });
  }
}