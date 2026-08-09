import { ArgumentsHost } from '@nestjs/common';
import DomainException from '@/customer-management/domain/exceptions/domain.exception';
import VehicleAlreadyExistsException from '@/customer-management/domain/exceptions/vehicle-already-exists.exception';
import VehicleNotFoundException from '@/customer-management/domain/exceptions/vehicle-not-found.exception';
import { VehicleExceptionFilter } from '@/customer-management/infra/filters/vehicle-exception.filter';

describe('VehicleExceptionFilter', () => {
  let filter: VehicleExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new VehicleExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: () => ({ getResponse: () => mockResponse }),
    } as unknown as ArgumentsHost;
  });

  it('maps VehicleAlreadyExistsException to 409', () => {
    const exc = new VehicleAlreadyExistsException();
    filter.catch(exc, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Vehicle Already Exists' }),
    );
  });

  it('maps VehicleNotFoundException to 404', () => {
    const exc = new VehicleNotFoundException();
    filter.catch(exc, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Vehicle Not Found' }),
    );
  });

  it('maps DomainException to 400', () => {
    const exc = new DomainException('Invalid vehicle');
    filter.catch(exc, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Bad Request' }),
    );
  });
});
