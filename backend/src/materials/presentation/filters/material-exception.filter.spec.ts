import { MaterialExceptionFilter } from './material-exception.filter';
import { ArgumentsHost } from '@nestjs/common';
import MaterialNotFoundException from '@materials/application/exceptions/material-not-found.exception';
import DomainException from '@materials/domain/exceptions/domain.exception';
import InsufficientMaterialStockException from '@materials/domain/exceptions/insufficient-material-stock.exception';

describe('MaterialExceptionFilter', () => {
  let filter: MaterialExceptionFilter;
  let mockResponse: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new MaterialExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: () => ({ getResponse: () => mockResponse }),
    } as any;
  });

  it('maps MaterialNotFoundException to 404', () => {
    const exc = new MaterialNotFoundException('Material not found');
    filter.catch(exc, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ status_code: 404, error: 'Not Found' }),
    );
  });

  it('maps InsufficientMaterialStockException to 409', () => {
    const exc = new InsufficientMaterialStockException('Parafuso', 5);
    filter.catch(exc, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ status_code: 409, error: 'Conflict' }),
    );
  });

  it('maps DomainException to 400', () => {
    const exc = new DomainException('Invalid material');
    filter.catch(exc, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ status_code: 400, error: 'Bad Request' }),
    );
  });
});
