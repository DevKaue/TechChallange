import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import VehicleAlreadyExistsException from '@customer-management/application/exceptions/vehicle-already-exists.exception';
import DomainException from '@customer-management/domain/exceptions/domain.exception';
import { Response } from 'express';

@Catch(VehicleAlreadyExistsException, DomainException)
export class VehicleExceptionFilter implements ExceptionFilter {
  catch(exception: VehicleAlreadyExistsException | DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.BAD_REQUEST;
    let errorTitle = 'Bad Request';

    if (exception instanceof VehicleAlreadyExistsException) {
      statusCode = HttpStatus.CONFLICT;
      errorTitle = 'Conflict';
    }

    response.status(statusCode).json({
      status_code: statusCode,
      error: errorTitle,
      message: exception.message,
    });
  }
}
