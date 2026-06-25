import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import CustomerAlreadyExistsException from '@/customer-management/domain/exceptions/customer-already-exists.exception';
import DomainException from '@customer-management/domain/exceptions/domain.exception';
import { Response } from 'express';
import CustomerNotFoundException from '@/customer-management/domain/exceptions/customer-not-found.exception';
import CustomerIsArchivedException from '@/customer-management/domain/exceptions/customer-is-archived.exception';

// 1. Passe todas as exceções que este filtro deve interceptar aqui dentro
@Catch(CustomerAlreadyExistsException, DomainException, CustomerNotFoundException, CustomerIsArchivedException)
export class CustomerExceptionFilter implements ExceptionFilter {
  catch(exception: CustomerAlreadyExistsException | DomainException | CustomerNotFoundException | CustomerIsArchivedException, host: ArgumentsHost) {
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
    } else if (exception instanceof CustomerIsArchivedException){
      statusCode = HttpStatus.CONFLICT;
      errorTitle = 'Customer Is Archived';
    }

    const errorCode = (exception as any).errorCode || null;

    response.status(statusCode).json({
      error: errorTitle,
      ...(errorCode ? { error_code: errorCode } : {}),
      message: exception.message,
    });
  }
}
