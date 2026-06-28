import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PerfilUsuario } from '@prisma/client';
import { ApiStandardErrors } from '../../common/decorators/api-standard-errors.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaResponseDto } from './dto/auditoria-response.dto';

@ApiTags('Auditoria')
@ApiBearerAuth()
@ApiStandardErrors()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @Roles(PerfilUsuario.ADMIN, PerfilUsuario.GERENTE)
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiOkResponse({ type: AuditoriaResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  findAll(@Query('limit') limit?: string) {
    return this.auditoriaService.findAll(Number(limit ?? 50));
  }
}
