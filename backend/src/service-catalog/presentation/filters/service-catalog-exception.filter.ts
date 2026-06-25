import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import DomainException from '@service-catalog/domain/exceptions/domain.exception';
import ServiceNotFoundException from '@service-catalog/application/exceptions/service-not-found.exception';

@Catch(ServiceNotFoundException, DomainException)
export class ServiceCatalogExceptionFilter implements ExceptionFilter {
  catch(
    exception: ServiceNotFoundException | DomainException,
    host: ArgumentsHost,
  ) {
    const response = host.switchToHttp().getResponse<Response>();

    const statusCode =
      exception instanceof ServiceNotFoundException
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST;

    response.status(statusCode).json({
      status_code: statusCode,
      error:
        statusCode === HttpStatus.NOT_FOUND ? 'Not Found' : 'Bad Request',
      message: exception.message,
    });
  }
}
