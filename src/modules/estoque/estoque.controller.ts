import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PerfilUsuario } from '@prisma/client';
import { ApiStandardErrors } from '../../common/decorators/api-standard-errors.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { EstoqueResponseDto } from './dto/estoque-response.dto';
import { MovimentarEstoqueDto } from './dto/movimentar-estoque.dto';
import { EstoqueService } from './estoque.service';

@ApiTags('Estoque')
@ApiBearerAuth()
@ApiStandardErrors()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('estoque')
export class EstoqueController {
  constructor(private readonly estoqueService: EstoqueService) {}

  @Get()
  @Roles(PerfilUsuario.ADMIN, PerfilUsuario.GERENTE, PerfilUsuario.ATENDENTE)
  @ApiQuery({ name: 'unidadeId', required: true })
  @ApiOkResponse({ type: EstoqueResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  @ApiForbiddenResponse({ description: 'Perfil sem permissão.' })
  findByUnidade(@Query('unidadeId') unidadeId: string) {
    return this.estoqueService.findByUnidade(unidadeId);
  }

  @Post('movimentacoes')
  @Roles(PerfilUsuario.ADMIN, PerfilUsuario.GERENTE, PerfilUsuario.ATENDENTE)
  @ApiCreatedResponse({ type: EstoqueResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  @ApiForbiddenResponse({ description: 'Perfil sem permissão.' })
  movimentar(@Body() dto: MovimentarEstoqueDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.estoqueService.movimentar(dto, usuario);
  }
}
