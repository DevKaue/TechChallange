import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';
import { UnauthorizedMechanicException } from '@service-orders/application/exceptions/unauthorized-mechanic.exception';
import { ServiceCatalogNotFoundException } from '@service-orders/application/exceptions/service-catalog-not-found.exception';
import { PartNotFoundException } from '@service-orders/application/exceptions/part-not-found.exception';
import { InvalidMaterialDataException } from '@service-orders/application/exceptions/invalid-material-data.exception';
import { CustomerNotFoundException } from '@service-orders/application/exceptions/customer-not-found.exception';

const exceptionStatusMap = new Map<Function, number>([
  [ServiceOrderNotFoundException, 404],
  [InvalidStatusTransitionException, 400],
  [UnauthorizedMechanicException, 403],
  [ServiceCatalogNotFoundException, 404],
  [PartNotFoundException, 404],
  [InvalidMaterialDataException, 400],
  [CustomerNotFoundException, 404],
]);

@Catch(
  ServiceOrderNotFoundException,
  InvalidStatusTransitionException,
  UnauthorizedMechanicException,
  ServiceCatalogNotFoundException,
  PartNotFoundException,
  InvalidMaterialDataException,
  CustomerNotFoundException,
)
export class ServiceOrderExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const error = exception as Error;
    const status = exceptionStatusMap.get(error.constructor) ?? 500;
    const message = error.message || 'Internal server error';

    response.status(status).json({
      status_code: status,
      error: error.constructor?.name ?? 'Error',
      message,
    });
  }
}
