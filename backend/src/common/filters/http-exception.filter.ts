import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();

      this.logger.warn(`${request.method} ${request.url} → ${status}`);

      return response.status(status).json({
        path: request.url,
        statusCode: status,
        error: errorResponse,
      });
    }

    // Erros de domínio (DomainException de qualquer bounded context) representam
    // violação de regra de negócio/entrada inválida → HTTP 400, não 500.
    if (exception instanceof Error && exception.name === 'DomainException') {
      this.logger.warn(`${request.method} ${request.url} → 400`);

      return response.status(400).json({
        path: request.url,
        statusCode: 400,
        error: exception.message,
      });
    }

    const stack =
      exception instanceof Error && exception.stack ? exception.stack : '';
    this.logger.error(
      `Unhandled exception on ${request.method} ${request.url}`,
      stack,
    );

    return response.status(500).json({
      path: request.url,
      statusCode: 500,
      error: 'Internal server error',
    });
  }
}
