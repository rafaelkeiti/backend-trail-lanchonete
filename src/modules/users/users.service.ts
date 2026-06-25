import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PerfilUsuario, Usuario } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UserResponseDto } from './user-response.dto';

type CreateUserInput = {
  nome: string;
  email: string;
  senhaHash: string;
  telefone?: string;
  perfil?: PerfilUsuario;
  consentimentoFidelidade?: boolean;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUserInput): Promise<UserResponseDto> {
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictException('Já existe um usuário cadastrado com este e-mail.');
    }

    const user = await this.prisma.usuario.create({
      data: {
        nome: input.nome,
        email: input.email,
        telefone: input.telefone,
        senhaHash: input.senhaHash,
        perfil: input.perfil ?? PerfilUsuario.CLIENTE,
        consentimentoFidelidade: input.consentimentoFidelidade ?? false,
        fidelidade: input.consentimentoFidelidade
          ? {
              create: {
                pontos: 0,
              },
            }
          : undefined,
      },
    });

    return this.toResponse(user);
  }

  findByEmail(email: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.toResponse(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.toResponse(user);
  }

  toResponse(user: Usuario): UserResponseDto {
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      perfil: user.perfil,
      consentimentoFidelidade: user.consentimentoFidelidade,
      createdAt: user.createdAt,
    };
  }
}
