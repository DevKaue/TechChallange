import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import MaterialNotFoundException from '@materials/application/exceptions/material-not-found.exception';
import DomainException from '@materials/domain/exceptions/domain.exception';
import InsufficientMaterialStockException from '@materials/domain/exceptions/insufficient-material-stock.exception';

@Catch(
  MaterialNotFoundException,
  DomainException,
  InsufficientMaterialStockException,
)
export class MaterialExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | MaterialNotFoundException
      | DomainException
      | InsufficientMaterialStockException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.BAD_REQUEST;
    let errorTitle = 'Bad Request';

    if (exception instanceof MaterialNotFoundException) {
      statusCode = HttpStatus.NOT_FOUND;
      errorTitle = 'Not Found';
    } else if (exception instanceof InsufficientMaterialStockException) {
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
