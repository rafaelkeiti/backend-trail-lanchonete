import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PerfilUsuario } from '@prisma/client';
import { ApiStandardErrors } from '../../common/decorators/api-standard-errors.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateUnidadeDto } from './dto/create-unidade.dto';
import { UnidadeResponseDto } from './dto/unidade-response.dto';
import { UnidadesService } from './unidades.service';

@ApiTags('Unidades')
@ApiStandardErrors()
@Controller('unidades')
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMIN, PerfilUsuario.GERENTE)
  @ApiCreatedResponse({ type: UnidadeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  @ApiForbiddenResponse({ description: 'Perfil sem permissão.' })
  create(@Body() dto: CreateUnidadeDto) {
    return this.unidadesService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: UnidadeResponseDto, isArray: true })
  findAll() {
    return this.unidadesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: UnidadeResponseDto })
  findOne(@Param('id') id: string) {
    return this.unidadesService.findOne(id);
  }
}
