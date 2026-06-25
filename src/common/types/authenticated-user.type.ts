import { PerfilUsuario } from '@prisma/client';

export type AuthenticatedUser = {
  id: string;
  email: string;
  perfil: PerfilUsuario;
};
