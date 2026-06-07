import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateApiKeyDto) {
    return this.apiKeyService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.apiKeyService.findAllByTenant(req.user.id);
  }

  @Patch(':id/revoke')
  revoke(@Param('id') id: string, @Request() req) {
    return this.apiKeyService.revoke(id, req.user.id);
  }
}