import { Test, TestingModule } from '@nestjs/testing';
import { UpdateEstimateStatusUseCase } from './update-estimate-status.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { EstimateNotFoundException } from '@service-orders/application/exceptions/estimate-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';

describe('UpdateEstimateStatusUseCase', () => {
  let useCase: UpdateEstimateStatusUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;

  const mockOrder: any = {
    id: 'order-1',
    status: ServiceOrderStatus.WAITING_APPROVAL,
    estimates: [],
    statusHistory: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UpdateEstimateStatusUseCase,
          useFactory: (repository: ServiceOrdersRepositoryInterface) =>
            new UpdateEstimateStatusUseCase(repository),
          inject: [ServiceOrdersRepositoryInterface],
        },
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findEstimateById: jest.fn(),
            updateEstimateStatus: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            createStatusHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(UpdateEstimateStatusUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
  });

  it('should approve estimate and move OS to IN_EXECUTION', async () => {
    const pendingEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.PENDING,
    } as any;
    const approvedEstimate = {
      ...pendingEstimate,
      status: EstimateStatus.APPROVED,
    };

    repository.findEstimateById.mockResolvedValue(pendingEstimate);
    repository.updateEstimateStatus.mockResolvedValue(approvedEstimate);
    repository.findById.mockResolvedValue(mockOrder);
    repository.update.mockResolvedValue({
      ...mockOrder,
      status: ServiceOrderStatus.IN_EXECUTION,
    });

    const result = await useCase.execute('est-1', {
      status: EstimateStatus.APPROVED,
    });

    expect(repository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({ status: ServiceOrderStatus.IN_EXECUTION }),
    );
    expect(result).toHaveProperty('status', EstimateStatus.APPROVED);
  });

  it('should handle non-approved status without transitioning OS', async () => {
    const mockEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.PENDING,
    } as any;

    repository.findEstimateById.mockResolvedValue(mockEstimate);
    repository.updateEstimateStatus.mockResolvedValue({
      ...mockEstimate,
      status: EstimateStatus.REJECTED,
    });

    const result = await useCase.execute('est-1', {
      status: EstimateStatus.REJECTED,
    });

    expect(repository.update).not.toHaveBeenCalled();
    expect(result).toHaveProperty('status', EstimateStatus.REJECTED);
  });

  it('should be idempotent when estimate already has the target status (APPROVED)', async () => {
    const mockEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.APPROVED,
    } as any;

    repository.findEstimateById.mockResolvedValue(mockEstimate);

    const result = await useCase.execute('est-1', {
      status: EstimateStatus.APPROVED,
    });

    expect(repository.updateEstimateStatus).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
    expect(repository.createStatusHistory).not.toHaveBeenCalled();
    expect(result).toHaveProperty('status', EstimateStatus.APPROVED);
  });

  it('should be idempotent when estimate already has the target status (REJECTED)', async () => {
    const mockEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.REJECTED,
    } as any;

    repository.findEstimateById.mockResolvedValue(mockEstimate);

    const result = await useCase.execute('est-1', {
      status: EstimateStatus.REJECTED,
    });

    expect(repository.updateEstimateStatus).not.toHaveBeenCalled();
    expect(result).toHaveProperty('status', EstimateStatus.REJECTED);
  });

  it('should throw when trying to change an already APPROVED estimate', async () => {
    const mockEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.APPROVED,
    } as any;

    repository.findEstimateById.mockResolvedValue(mockEstimate);

    await expect(
      useCase.execute('est-1', { status: EstimateStatus.REJECTED }),
    ).rejects.toThrow(InvalidStatusTransitionException);

    expect(repository.updateEstimateStatus).not.toHaveBeenCalled();
  });

  it('should throw if service order not found after approve', async () => {
    const mockEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.PENDING,
    } as any;

    repository.findEstimateById.mockResolvedValue(mockEstimate);
    repository.updateEstimateStatus.mockResolvedValue({
      ...mockEstimate,
      status: EstimateStatus.APPROVED,
    });
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('est-1', { status: EstimateStatus.APPROVED }),
    ).rejects.toThrow(ServiceOrderNotFoundException);
  });

  it('should throw when order status is invalid for approve', async () => {
    const mockEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.PENDING,
    } as any;

    repository.findEstimateById.mockResolvedValue(mockEstimate);
    repository.updateEstimateStatus.mockResolvedValue({
      ...mockEstimate,
      status: EstimateStatus.APPROVED,
    });
    repository.findById.mockResolvedValue({
      ...mockOrder,
      status: ServiceOrderStatus.RECEIVED,
    });

    await expect(
      useCase.execute('est-1', { status: EstimateStatus.APPROVED }),
    ).rejects.toThrow(InvalidStatusTransitionException);
  });

  it('should throw EstimateNotFoundException when estimate does not exist', async () => {
    repository.findEstimateById.mockResolvedValue(null);

    await expect(
      useCase.execute('est-1', { status: EstimateStatus.APPROVED }),
    ).rejects.toThrow(EstimateNotFoundException);

    expect(repository.updateEstimateStatus).not.toHaveBeenCalled();
  });
});
