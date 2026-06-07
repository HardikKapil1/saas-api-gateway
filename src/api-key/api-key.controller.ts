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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('API Keys')
@ApiBearerAuth('JWT')
@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({ status: 201, description: 'API key created' })
  create(@Request() req, @Body() dto: CreateApiKeyDto) {
    return this.apiKeyService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all API keys for tenant' })
  @ApiResponse({ status: 200, description: 'List of API keys' })
  findAll(@Request() req) {
    return this.apiKeyService.findAllByTenant(req.user.id);
  }

  @Patch(':id/revoke')
  @ApiOperation({ summary: 'Revoke an API key' })
  @ApiParam({ name: 'id', description: 'API key ID' })
  @ApiResponse({ status: 200, description: 'API key revoked' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  revoke(@Param('id') id: string, @Request() req) {
    return this.apiKeyService.revoke(id, req.user.id);
  }
}
