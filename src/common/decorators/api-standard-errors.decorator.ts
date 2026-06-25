import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';

export function ApiStandardErrors() {
  return applyDecorators(
    ApiBadRequestResponse({ type: ErrorResponseDto, description: 'Erro de validação.' }),
    ApiUnauthorizedResponse({ type: ErrorResponseDto, description: 'Token está ausente ou inválido.' }),
    ApiForbiddenResponse({ type: ErrorResponseDto, description: 'Perfil não tem permissão.' }),
    ApiNotFoundResponse({ type: ErrorResponseDto, description: 'O recurso não fio encontrado.' }),
    ApiConflictResponse({ type: ErrorResponseDto, description: 'Conflito de alguma regra de negócio.' }),
  );
}
