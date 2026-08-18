import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';
import { UnauthorizedMechanicException } from '@service-orders/application/exceptions/unauthorized-mechanic.exception';
import { ServiceCatalogNotFoundException } from '@service-orders/application/exceptions/service-catalog-not-found.exception';
import { PartNotFoundException } from '@service-orders/application/exceptions/part-not-found.exception';
import { InsufficientStockException } from '@service-orders/application/exceptions/insufficient-stock.exception';
import { VehicleNotFoundException } from '@service-orders/application/exceptions/vehicle-not-found.exception';
import { VehicleOwnerMismatchException } from '@service-orders/application/exceptions/vehicle-owner-mismatch.exception';
import { InvalidMaterialDataException } from '@service-orders/application/exceptions/invalid-material-data.exception';
import { CustomerNotFoundException } from '@service-orders/application/exceptions/customer-not-found.exception';
import { UserNotMechanicException } from '@service-orders/domain/exceptions/user-not-mechanic.exception';
import { EstimateNotFoundException } from '@service-orders/application/exceptions/estimate-not-found.exception';

@Catch(
  ServiceOrderNotFoundException,
  InvalidStatusTransitionException,
  UnauthorizedMechanicException,
  ServiceCatalogNotFoundException,
  PartNotFoundException,
  InsufficientStockException,
  VehicleNotFoundException,
  VehicleOwnerMismatchException,
  InvalidMaterialDataException,
  CustomerNotFoundException,
  UserNotMechanicException,
  EstimateNotFoundException,
)
export class ServiceOrderExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof ServiceOrderNotFoundException) {
      status = 404;
      message = exception.message;
    } else if (exception instanceof InvalidStatusTransitionException) {
      status = 400;
      message = exception.message;
    } else if (exception instanceof UnauthorizedMechanicException) {
      status = 403;
      message = exception.message;
    } else if (exception instanceof ServiceCatalogNotFoundException) {
      status = 404;
      message = exception.message;
    } else if (exception instanceof PartNotFoundException) {
      status = 404;
      message = exception.message;
    } else if (exception instanceof InsufficientStockException) {
      status = 409;
      message = exception.message;
    } else if (exception instanceof VehicleNotFoundException) {
      status = 404;
      message = exception.message;
    } else if (exception instanceof VehicleOwnerMismatchException) {
      status = 400;
      message = exception.message;
    } else if (exception instanceof InvalidMaterialDataException) {
      status = 400;
      message = exception.message;
    } else if (exception instanceof CustomerNotFoundException) {
      status = 404;
      message = exception.message;
    } else if (exception instanceof UserNotMechanicException) {
      status = 404;
      message = exception.message;
    } else if (exception instanceof EstimateNotFoundException) {
      status = 404;
      message = exception.message;
    }

    response.status(status).json({
      status_code: status,
      error: (exception as Error).constructor?.name ?? 'Error',
      message,
    });
  }
}
