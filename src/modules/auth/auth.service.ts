import { UnauthorizedException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PerfilUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const user = await this.usersService.create({
      nome: dto.nome,
      email: dto.email,
      telefone: dto.telefone,
      senhaHash,
      perfil: PerfilUsuario.CLIENTE,
      consentimentoFidelidade: dto.consentimentoFidelidade,
    });

    return this.createAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const passwordMatches = await bcrypt.compare(dto.senha, user.senhaHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    return this.createAuthResponse(this.usersService.toResponse(user));
  }

  private async createAuthResponse(user: AuthResponseDto['user']): Promise<AuthResponseDto> {
    const expiresIn = this.getExpiresInSeconds();
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        perfil: user.perfil,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET') ?? 'dev-secret-local',
        expiresIn,
      },
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user,
    };
  }

  private getExpiresInSeconds(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') ?? '1h';

    if (expiresIn.endsWith('h')) {
      return Number(expiresIn.replace('h', '')) * 60 * 60;
    }

    if (expiresIn.endsWith('m')) {
      return Number(expiresIn.replace('m', '')) * 60;
    }

    return Number(expiresIn);
  }
}
