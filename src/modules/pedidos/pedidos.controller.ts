import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CanalPedido, PerfilUsuario, StatusPedido } from '@prisma/client';
import { ApiStandardErrors } from '../../common/decorators/api-standard-errors.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { PedidoResponseDto } from './dto/pedido-response.dto';
import { UpdatePedidoStatusDto } from './dto/update-pedido-status.dto';
import { PedidosService } from './pedidos.service';

@ApiTags('Pedidos')
@ApiBearerAuth()
@ApiStandardErrors()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @Roles(PerfilUsuario.CLIENTE, PerfilUsuario.ATENDENTE, PerfilUsuario.ADMIN, PerfilUsuario.GERENTE)
  @ApiCreatedResponse({ type: PedidoResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  @ApiForbiddenResponse({ description: 'Perfil sem permissão.' })
  create(@Body() dto: CreatePedidoDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.pedidosService.create(dto, usuario);
  }

  @Get()
  @Roles(PerfilUsuario.ADMIN, PerfilUsuario.GERENTE, PerfilUsuario.ATENDENTE, PerfilUsuario.COZINHA)
  @ApiQuery({ name: 'canalPedido', enum: CanalPedido, required: false })
  @ApiQuery({ name: 'status', enum: StatusPedido, required: false })
  @ApiOkResponse({ type: PedidoResponseDto, isArray: true })
  findAll(@Query('canalPedido') canalPedido?: CanalPedido, @Query('status') status?: StatusPedido) {
    return this.pedidosService.findAll({ canalPedido, status });
  }

  @Get(':id')
  @Roles(
    PerfilUsuario.CLIENTE,
    PerfilUsuario.ADMIN,
    PerfilUsuario.GERENTE,
    PerfilUsuario.ATENDENTE,
    PerfilUsuario.COZINHA,
  )
  @ApiOkResponse({ type: PedidoResponseDto })
  findOne(@Param('id') id: string, @CurrentUser() usuario: AuthenticatedUser) {
    return this.pedidosService.findOne(id, usuario);
  }

  @Patch(':id/status')
  @Roles(PerfilUsuario.ADMIN, PerfilUsuario.GERENTE, PerfilUsuario.ATENDENTE, PerfilUsuario.COZINHA)
  @ApiOkResponse({ type: PedidoResponseDto })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePedidoStatusDto,
    @CurrentUser() usuario: AuthenticatedUser,
  ) {
    return this.pedidosService.updateStatus(id, dto, usuario);
  }

  @Delete(':id')
  @Roles(PerfilUsuario.CLIENTE, PerfilUsuario.ADMIN, PerfilUsuario.GERENTE, PerfilUsuario.ATENDENTE)
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Pedido cancelado.' })
  cancel(@Param('id') id: string, @CurrentUser() usuario: AuthenticatedUser) {
    return this.pedidosService.cancel(id, usuario);
  }
}
