import { ServiceCatalogExceptionFilter } from './service-catalog-exception.filter';
import { ArgumentsHost } from '@nestjs/common';
import DomainException from '@service-catalog/domain/exceptions/domain.exception';
import ServiceNotFoundException from '@service-catalog/application/exceptions/service-not-found.exception';

describe('ServiceCatalogExceptionFilter', () => {
  let filter: ServiceCatalogExceptionFilter;
  let mockResponse: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new ServiceCatalogExceptionFilter();
    mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    mockHost = { switchToHttp: () => ({ getResponse: () => mockResponse }) } as any;
  });

  it('maps ServiceNotFoundException to 404', () => {
    const exc = new ServiceNotFoundException('svc-1');
    filter.catch(exc, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ status_code: 404, error: 'Not Found' }),
    );
  });

  it('maps DomainException to 400', () => {
    const exc = new DomainException('Invalid service');
    filter.catch(exc, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ status_code: 400, error: 'Bad Request' }),
    );
  });
});
