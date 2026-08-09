import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import CustomerAlreadyExistsException from '@/customer-management/domain/exceptions/customer-already-exists.exception';
import CustomerIsArchivedException from '@/customer-management/domain/exceptions/customer-is-archived.exception';
import CustomerNotFoundException from '@/customer-management/domain/exceptions/customer-not-found.exception';
import DomainException from '@/customer-management/domain/exceptions/domain.exception';

@Catch(
  CustomerAlreadyExistsException,
  DomainException,
  CustomerNotFoundException,
  CustomerIsArchivedException,
)
export class CustomerExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | CustomerAlreadyExistsException
      | DomainException
      | CustomerNotFoundException
      | CustomerIsArchivedException,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let statusCode = HttpStatus.BAD_REQUEST;
    let errorTitle = 'Bad Request';

    if (exception instanceof CustomerAlreadyExistsException) {
      statusCode = HttpStatus.CONFLICT;
      errorTitle = 'Customer Already Exists';
    } else if (exception instanceof CustomerNotFoundException) {
      statusCode = HttpStatus.NOT_FOUND;
      errorTitle = 'Customer Not Found';
    } else if (exception instanceof CustomerIsArchivedException) {
      statusCode = HttpStatus.CONFLICT;
      errorTitle = 'Customer Is Archived';
    }

    const withErrorCode = exception as { errorCode?: string };

    response.status(statusCode).json({
      error: errorTitle,
      ...(withErrorCode.errorCode ? { error_code: withErrorCode.errorCode } : {}),
      message: exception.message,
    });
  }
}
