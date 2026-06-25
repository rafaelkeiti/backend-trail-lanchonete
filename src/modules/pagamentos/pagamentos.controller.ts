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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { MockPagamentoDto } from './dto/mock-pagamento.dto';
import { PagamentoResponseDto } from './dto/pagamento-response.dto';
import { PagamentosService } from './pagamentos.service';

@ApiTags('Pagamentos')
@ApiBearerAuth()
@ApiStandardErrors()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post('mock')
  @Roles(PerfilUsuario.CLIENTE, PerfilUsuario.ATENDENTE, PerfilUsuario.ADMIN, PerfilUsuario.GERENTE)
  @ApiCreatedResponse({ type: PagamentoResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  @ApiForbiddenResponse({ description: 'Perfil sem permissão.' })
  processarMock(@Body() dto: MockPagamentoDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.pagamentosService.processarMock(dto, usuario);
  }

  @Get(':id')
  @Roles(PerfilUsuario.ADMIN, PerfilUsuario.GERENTE, PerfilUsuario.ATENDENTE)
  @ApiOkResponse({ type: PagamentoResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  @ApiForbiddenResponse({ description: 'Perfil sem permissão.' })
  findOne(@Param('id') id: string) {
    return this.pagamentosService.findOne(id);
  }
}
