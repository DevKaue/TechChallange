import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import CustomerAlreadyExistsException from '@customer-management/application/exceptions/customer-already-exists.exception';
import DomainException from '@customer-management/domain/exceptions/domain.exception';
import { Response } from 'express';

// 1. Passe todas as exceções que este filtro deve interceptar aqui dentro
@Catch(CustomerAlreadyExistsException, DomainException)
export class CustomerExceptionFilter implements ExceptionFilter {
  catch(exception: CustomerAlreadyExistsException | DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.BAD_REQUEST;
    let errorTitle = 'Bad Request';

    if (exception instanceof CustomerAlreadyExistsException) {
      statusCode = HttpStatus.CONFLICT;
      errorTitle = 'Conflict';
    }

    response.status(statusCode).json({
      statusCode: statusCode,
      error: errorTitle,
      message: exception.message,
    });
  }
}
