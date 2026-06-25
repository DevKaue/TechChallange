import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import CustomerAlreadyExistsException from '@customer-management/application/exceptions/customer-already-exists.exception';
import DomainException from '@customer-management/domain/exceptions/domain.exception';
import { Response } from 'express';
import CustomerNotFoundException from '@/customer-management/application/exceptions/customer-not-found.exception';

// 1. Passe todas as exceções que este filtro deve interceptar aqui dentro
@Catch(CustomerAlreadyExistsException, DomainException, CustomerNotFoundException)
export class CustomerExceptionFilter implements ExceptionFilter {
  catch(exception: CustomerAlreadyExistsException | DomainException | CustomerNotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.BAD_REQUEST;
    let errorTitle = 'Bad Request';

    if (exception instanceof CustomerAlreadyExistsException) {
      statusCode = HttpStatus.CONFLICT;
      errorTitle = 'Customer Already Exists';
    }else if (exception instanceof CustomerNotFoundException) {
      statusCode = HttpStatus.NOT_FOUND;
      errorTitle = 'Customer Not Found';
    }

    response.status(statusCode).json({
      status_code: statusCode,
      error: errorTitle,
      message: exception.message,
    });
  }
}
