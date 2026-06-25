import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

type ErrorDetail = {
  field: string;
  issue: string;
};

type ErrorBody = {
  error?: string;
  message?: string | string[];
  details?: ErrorDetail[];
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const requestId = this.getRequestId(request);
    const status = this.getStatus(exception);
    const body = this.getBody(exception, status);

    response.status(status).json({
      error: body.error,
      message: body.message,
      details: body.details,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      requestId,
    });
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        return HttpStatus.CONFLICT;
      }

      if (exception.code === 'P2025') {
        return HttpStatus.NOT_FOUND;
      }
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getBody(exception: unknown, status: number): Required<ErrorBody> {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'object' && response !== null) {
        const body = response as ErrorBody;
        return {
          error: this.normalizeError(body.error, status),
          message: this.normalizeMessage(body.message, exception.message),
          details: body.details ?? [],
        };
      }

      return {
        error: this.defaultError(status),
        message: exception.message,
        details: [],
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.getPrismaBody(exception);
    }

    return {
      error: 'ERRO_INTERNO',
      message: 'Erro interno inesperado.',
      details: [],
    };
  }

  private getPrismaBody(exception: Prisma.PrismaClientKnownRequestError): Required<ErrorBody> {
    if (exception.code === 'P2002') {
      return {
        error: 'CONFLITO_DADOS',
        message: 'Já existe um registro com os dados informados.',
        details: [],
      };
    }

    if (exception.code === 'P2025') {
      return {
        error: 'RECURSO_NAO_ENCONTRADO',
        message: 'Registro não encontrado.',
        details: [],
      };
    }

    return {
      error: 'ERRO_BANCO_DADOS',
      message: 'Erro ao acessar o banco de dados.',
      details: [],
    };
  }

  private normalizeMessage(message: string | string[] | undefined, fallback: string): string {
    if (Array.isArray(message)) {
      return message.join('; ');
    }

    return message ?? fallback;
  }

  private normalizeError(error: string | undefined, status: number): string {
    if (error && /^[A-Z0-9_]+$/.test(error)) {
      return error;
    }

    return this.defaultError(status);
  }

  private defaultError(status: number): string {
    const errors: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'REQUISICAO_INVALIDA',
      [HttpStatus.UNAUTHORIZED]: 'NAO_AUTENTICADO',
      [HttpStatus.FORBIDDEN]: 'SEM_PERMISSAO',
      [HttpStatus.NOT_FOUND]: 'RECURSO_NAO_ENCONTRADO',
      [HttpStatus.CONFLICT]: 'CONFLITO_REGRA_NEGOCIO',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDACAO_INVALIDA',
    };

    return errors[status] ?? 'ERRO_INTERNO';
  }

  private getRequestId(request: Request): string {
    const header = request.headers['x-request-id'];

    if (typeof header === 'string') {
      return header;
    }

    return randomUUID();
  }
}
