import { CustomerExceptionFilter } from './customer-exception.filter';
import { ArgumentsHost } from '@nestjs/common';
import CustomerAlreadyExistsException from '@customer-management/domain/exceptions/customer-already-exists.exception';
import CustomerNotFoundException from '@customer-management/domain/exceptions/customer-not-found.exception';
import CustomerIsArchivedException from '@customer-management/domain/exceptions/customer-is-archived.exception';
import DomainException from '@customer-management/domain/exceptions/domain.exception';

describe('CustomerExceptionFilter', () => {
  let filter: CustomerExceptionFilter;
  let mockResponse: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new CustomerExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: () => ({ getResponse: () => mockResponse }),
    } as any;
  });

  it('maps CustomerAlreadyExistsException to 409', () => {
    const exc = new CustomerAlreadyExistsException();
    filter.catch(exc, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Customer Already Exists',
        error_code: 'customer_already_exists',
      }),
    );
  });

  it('maps CustomerNotFoundException to 404', () => {
    const exc = new CustomerNotFoundException();
    filter.catch(exc, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Customer Not Found',
        error_code: 'customer_not_found',
      }),
    );
  });

  it('maps CustomerIsArchivedException to 409', () => {
    const exc = new CustomerIsArchivedException();
    filter.catch(exc, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Customer Is Archived',
        error_code: 'customer_is_archived',
      }),
    );
  });

  it('maps DomainException to 400', () => {
    const exc = new DomainException('Invalid');
    filter.catch(exc, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Bad Request' }),
    );
  });
});
