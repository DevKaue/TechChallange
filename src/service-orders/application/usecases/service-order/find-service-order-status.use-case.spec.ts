import { FindServiceOrderStatusUseCase } from './find-service-order-status.use-case';
import { ServiceOrderQueryServiceInterface } from '@service-orders/application/contracts/service-order-query-service.interface';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';

describe('FindServiceOrderStatusUseCase', () => {
  let findStatus: jest.MockedFunction<
    ServiceOrderQueryServiceInterface['findStatus']
  >;
  let useCase: FindServiceOrderStatusUseCase;

  beforeEach(() => {
    findStatus = jest.fn();
    const queryService = {
      findStatus,
    } as unknown as ServiceOrderQueryServiceInterface;
    useCase = new FindServiceOrderStatusUseCase(queryService);
  });

  it('should return the current service order status', async () => {
    const updatedAt = new Date('2026-08-17T12:00:00.000Z');
    findStatus.mockResolvedValue({
      id: 'order-1',
      status: ServiceOrderStatus.IN_DIAGNOSIS,
      updatedAt,
    });

    await expect(useCase.execute('order-1')).resolves.toEqual({
      id: 'order-1',
      status: ServiceOrderStatus.IN_DIAGNOSIS,
      updatedAt,
    });
  });

  it('should throw when the service order does not exist', async () => {
    findStatus.mockResolvedValue(null);

    await expect(useCase.execute('missing-order')).rejects.toThrow(
      ServiceOrderNotFoundException,
    );
  });
});
