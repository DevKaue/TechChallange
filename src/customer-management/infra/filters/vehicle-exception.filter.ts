import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import DomainException from '@/customer-management/domain/exceptions/domain.exception';
import VehicleAlreadyExistsException from '@/customer-management/domain/exceptions/vehicle-already-exists.exception';
import VehicleNotFoundException from '@/customer-management/domain/exceptions/vehicle-not-found.exception';

@Catch(VehicleAlreadyExistsException, DomainException, VehicleNotFoundException)
export class VehicleExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | VehicleAlreadyExistsException
      | DomainException
      | VehicleNotFoundException,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let statusCode = HttpStatus.BAD_REQUEST;
    let errorTitle = 'Bad Request';

    if (exception instanceof VehicleAlreadyExistsException) {
      statusCode = HttpStatus.CONFLICT;
      errorTitle = 'Vehicle Already Exists';
    } else if (exception instanceof VehicleNotFoundException) {
      statusCode = HttpStatus.NOT_FOUND;
      errorTitle = 'Vehicle Not Found';
    }

    const withErrorCode = exception as { errorCode?: string };

    response.status(statusCode).json({
      error: errorTitle,
      ...(withErrorCode.errorCode ? { error_code: withErrorCode.errorCode } : {}),
      message: exception.message,
    });
  }
}
