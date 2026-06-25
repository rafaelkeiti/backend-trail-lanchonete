import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PerfilUsuario } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { FidelidadeResponseDto } from './dto/fidelidade-response.dto';
import { ResgatarPontosDto } from './dto/resgatar-pontos.dto';
import { FidelidadeService } from './fidelidade.service';

@ApiTags('Fidelidade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(PerfilUsuario.CLIENTE)
@Controller('fidelidade')
export class FidelidadeController {
  constructor(private readonly fidelidadeService: FidelidadeService) {}

  @Get('saldo')
  @ApiOkResponse({ type: FidelidadeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  saldo(@CurrentUser() usuario: AuthenticatedUser) {
    return this.fidelidadeService.saldo(usuario);
  }

  @Post('resgatar')
  @ApiOkResponse({ type: FidelidadeResponseDto })
  @ApiConflictResponse({ description: 'Saldo insuficiente.' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido.' })
  resgatar(@Body() dto: ResgatarPontosDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.fidelidadeService.resgatar(dto, usuario);
  }
}
