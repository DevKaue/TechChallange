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
import VehicleAlreadyExistsException from '@/customer-management/domain/exceptions/vehicle-already-exists.exception';
import VehicleNotFoundException from '@/customer-management/domain/exceptions/vehicle-not-found.exception';

type KnownDomainError =
  | DomainException
  | CustomerAlreadyExistsException
  | CustomerIsArchivedException
  | CustomerNotFoundException
  | VehicleAlreadyExistsException
  | VehicleNotFoundException;

@Catch(
  DomainException,
  CustomerAlreadyExistsException,
  CustomerIsArchivedException,
  CustomerNotFoundException,
  VehicleAlreadyExistsException,
  VehicleNotFoundException,
)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: KnownDomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const statusCode = this.resolveStatusCode(exception);
    const errorTitle = this.resolveErrorTitle(exception);
    const withErrorCode = exception as { errorCode?: string };

    response.status(statusCode).json({
      error: errorTitle,
      ...(withErrorCode.errorCode ? { error_code: withErrorCode.errorCode } : {}),
      message: exception.message,
    });
  }

  private resolveStatusCode(exception: KnownDomainError): number {
    if (
      exception instanceof CustomerNotFoundException ||
      exception instanceof VehicleNotFoundException
    ) {
      return HttpStatus.NOT_FOUND;
    }

    if (
      exception instanceof CustomerAlreadyExistsException ||
      exception instanceof CustomerIsArchivedException ||
      exception instanceof VehicleAlreadyExistsException
    ) {
      return HttpStatus.CONFLICT;
    }

    return HttpStatus.BAD_REQUEST;
  }

  private resolveErrorTitle(exception: KnownDomainError): string {
    if (exception instanceof CustomerAlreadyExistsException) {
      return 'Customer Already Exists';
    }

    if (exception instanceof CustomerIsArchivedException) {
      return 'Customer Is Archived';
    }

    if (exception instanceof CustomerNotFoundException) {
      return 'Customer Not Found';
    }

    if (exception instanceof VehicleAlreadyExistsException) {
      return 'Vehicle Already Exists';
    }

    if (exception instanceof VehicleNotFoundException) {
      return 'Vehicle Not Found';
    }

    return 'Bad Request';
  }
}