import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { ProdutoResponseDto } from './dto/produto-response.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { ProdutosService } from './produtos.service';

@ApiTags('Produtos')
@ApiStandardErrors()
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMIN, PerfilUsuario.GERENTE)
  @ApiCreatedResponse({ type: ProdutoResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  @ApiForbiddenResponse({ description: 'Perfil sem permissão.' })
  create(@Body() dto: CreateProdutoDto) {
    return this.produtosService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({ description: 'Lista paginada de produtos.' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.produtosService.findAll(Number(page ?? 1), Number(limit ?? 10));
  }

  @Get(':id')
  @ApiOkResponse({ type: ProdutoResponseDto })
  findOne(@Param('id') id: string) {
    return this.produtosService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PerfilUsuario.ADMIN, PerfilUsuario.GERENTE)
  @ApiOkResponse({ type: ProdutoResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  @ApiForbiddenResponse({ description: 'Perfil sem permissão.' })
  update(@Param('id') id: string, @Body() dto: UpdateProdutoDto) {
    return this.produtosService.update(id, dto);
  }
}
