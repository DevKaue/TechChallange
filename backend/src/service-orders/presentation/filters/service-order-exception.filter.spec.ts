import { ServiceOrderExceptionFilter } from './service-order-exception.filter';
import { ArgumentsHost } from '@nestjs/common';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';
import { UnauthorizedMechanicException } from '@service-orders/application/exceptions/unauthorized-mechanic.exception';
import { ServiceCatalogNotFoundException } from '@service-orders/application/exceptions/service-catalog-not-found.exception';
import { PartNotFoundException } from '@service-orders/application/exceptions/part-not-found.exception';
import { InvalidMaterialDataException } from '@service-orders/application/exceptions/invalid-material-data.exception';
import { CustomerNotFoundException } from '@service-orders/application/exceptions/customer-not-found.exception';

describe('ServiceOrderExceptionFilter', () => {
  let filter: ServiceOrderExceptionFilter;
  let mockResponse: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new ServiceOrderExceptionFilter();
    mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    mockHost = { switchToHttp: () => ({ getResponse: () => mockResponse }) } as any;
  });

  it.each([
    [ServiceOrderNotFoundException, 404, 'os-123'],
    [InvalidStatusTransitionException, 400, 'Invalid transition'],
    [UnauthorizedMechanicException, 403, 'Not authorized'],
    [ServiceCatalogNotFoundException, 404, 'svc-1'],
    [PartNotFoundException, 404, 'part-1'],
    [InvalidMaterialDataException, 400, 'Bad material'],
    [CustomerNotFoundException, 404, 'cust-1'],
  ])('maps %s to status %i', (ExcClass, expectedStatus, msg) => {
    const exc = new (ExcClass as any)(msg);
    filter.catch(exc, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(expectedStatus);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ status_code: expectedStatus, message: exc.message }),
    );
  });
});
