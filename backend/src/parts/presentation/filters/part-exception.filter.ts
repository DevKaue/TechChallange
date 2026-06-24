import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import PartNotFoundException from '@parts/application/exceptions/part-not-found.exception';
import DomainException from '@parts/domain/exceptions/domain.exception';
import InsufficientPartStockException from '@parts/domain/exceptions/insufficient-part-stock.exception';

@Catch(PartNotFoundException, DomainException, InsufficientPartStockException)
export class PartExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | PartNotFoundException
      | DomainException
      | InsufficientPartStockException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.BAD_REQUEST;
    let errorTitle = 'Bad Request';

    if (exception instanceof PartNotFoundException) {
      statusCode = HttpStatus.NOT_FOUND;
      errorTitle = 'Not Found';
    } else if (exception instanceof InsufficientPartStockException) {
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
