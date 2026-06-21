import { Test, TestingModule } from '@nestjs/testing';
import { EstimateUseCase } from './estimate.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import {
  PartRepository,
  PART_REPOSITORY,
} from '@service-orders/domain/acls/part-repository.interface';
import {
  ServiceCatalogRepository,
  SERVICE_CATALOG_REPOSITORY,
} from '@service-orders/domain/acls/service-catalog-repository.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

describe('EstimateUseCase', () => {
  let useCase: EstimateUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;
  let partRepository: jest.Mocked<PartRepository>;
  let serviceCatalogRepository: jest.Mocked<ServiceCatalogRepository>;

  const mockOrder: any = {
    id: 'order-1',
    customerId: 'client-1',
    vehicleId: 'vehicle-1',
    status: ServiceOrderStatus.RECEIVED,
    mileage: null,
    notes: null,
    mechanicId: null,
    closedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: {
      id: 'client-1',
      document: '123',
      email: null,
      phone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    vehicle: {
      id: 'vehicle-1',
      plate: 'ABC-123',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      customerId: 'client-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    mechanic: null,
    estimates: [],
    statusHistory: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstimateUseCase,
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findById: jest.fn(),
            updateStatus: jest.fn(),
            createStatusHistory: jest.fn(),
            createEstimate: jest.fn(),
            addEstimateItem: jest.fn(),
            updateEstimateStatus: jest.fn(),
          },
        },
        {
          provide: PART_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            decrementStock: jest.fn(),
          },
        },
        {
          provide: SERVICE_CATALOG_REPOSITORY,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(EstimateUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
    partRepository = module.get(PART_REPOSITORY);
    serviceCatalogRepository = module.get(SERVICE_CATALOG_REPOSITORY);
  });

  describe('createEstimate', () => {
    it('should create estimate and move to WAITING_APPROVAL', async () => {
      const orderInDiagnosis = {
        ...mockOrder,
        status: ServiceOrderStatus.IN_DIAGNOSIS,
      };
      repository.findById.mockResolvedValue(orderInDiagnosis);
      const mockEstimate = {
        id: 'est-1',
        serviceOrderId: 'order-1',
        status: EstimateStatus.PENDING,
        totalAmount: 0,
        validUntil: null,
        approvedAt: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      } as any;
      repository.createEstimate.mockResolvedValue(mockEstimate);
      repository.updateStatus.mockResolvedValue({
        ...mockOrder,
        status: ServiceOrderStatus.WAITING_APPROVAL,
      });
      repository.createStatusHistory.mockResolvedValue({} as any);

      const result = await useCase.createEstimate('order-1');

      expect(repository.createEstimate).toHaveBeenCalledWith({
        serviceOrderId: 'order-1',
        status: EstimateStatus.PENDING,
        totalAmount: 0,
      });
      expect(result).toHaveProperty('id', 'est-1');
    });

    it('should throw if order not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(useCase.createEstimate('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addEstimateItem', () => {
    it('should add a service item from catalog', async () => {
      serviceCatalogRepository.findById.mockResolvedValue({
        id: 'svc-1',
        price: 150,
      });
      repository.addEstimateItem.mockResolvedValue({
        id: 'item-1',
        estimateId: 'est-1',
        itemType: 'SERVICE',
        referenceId: 'svc-1',
        description: 'Troca de oleo',
        quantity: 1,
        unitPrice: 150,
        totalPrice: 150,
        notes: null,
      } as any);

      const result = await useCase.addEstimateItem('est-1', {
        itemType: 'SERVICE',
        referenceId: 'svc-1',
        description: 'Troca de oleo',
        quantity: 1,
      });

      expect(repository.addEstimateItem).toHaveBeenCalledWith(
        expect.objectContaining({ unitPrice: 150, totalPrice: 150 }),
      );
      expect(result).toHaveProperty('id', 'item-1');
    });

    it('should add a part item with stock decrement', async () => {
      partRepository.findById.mockResolvedValue({
        id: 'part-1',
        name: 'Filtro de oleo',
        price: 45,
        stockQuantity: 10,
      });
      repository.addEstimateItem.mockResolvedValue({
        id: 'item-2',
        estimateId: 'est-1',
        itemType: 'PART',
        referenceId: 'part-1',
        description: 'Filtro de oleo',
        quantity: 2,
        unitPrice: 45,
        totalPrice: 90,
        notes: null,
      } as any);

      const result = await useCase.addEstimateItem('est-1', {
        itemType: 'PART',
        referenceId: 'part-1',
        quantity: 2,
      });

      expect(partRepository.decrementStock).toHaveBeenCalledWith('part-1', 2);
      expect(result).toHaveProperty('id', 'item-2');
    });

    it('should throw if service not found in catalog', async () => {
      serviceCatalogRepository.findById.mockResolvedValue(null);
      await expect(
        useCase.addEstimateItem('est-1', {
          itemType: 'SERVICE' as any,
          referenceId: 'invalid',
          quantity: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if part stock is insufficient', async () => {
      partRepository.findById.mockResolvedValue({
        id: 'part-1',
        name: 'Filtro de oleo',
        price: 45,
        stockQuantity: 1,
      });
      await expect(
        useCase.addEstimateItem('est-1', {
          itemType: 'PART' as any,
          referenceId: 'part-1',
          quantity: 5,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw if part not found', async () => {
      partRepository.findById.mockResolvedValue(null);
      await expect(
        useCase.addEstimateItem('est-1', {
          itemType: 'PART' as any,
          referenceId: 'invalid',
          quantity: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateEstimateStatus', () => {
    it('should approve estimate and move OS to IN_EXECUTION', async () => {
      const mockEstimate = {
        id: 'est-1',
        serviceOrderId: 'order-1',
        status: EstimateStatus.APPROVED,
        totalAmount: 150,
        validUntil: null,
        approvedAt: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      } as any;
      repository.updateEstimateStatus.mockResolvedValue(mockEstimate);
      repository.findById.mockResolvedValue({
        ...mockOrder,
        status: ServiceOrderStatus.WAITING_APPROVAL,
      });
      repository.updateStatus.mockResolvedValue({
        ...mockOrder,
        status: ServiceOrderStatus.IN_EXECUTION,
      });
      repository.createStatusHistory.mockResolvedValue({} as any);

      const result = await useCase.updateEstimateStatus('est-1', {
        status: EstimateStatus.APPROVED,
      });

      expect(repository.updateStatus).toHaveBeenCalledWith(
        'order-1',
        ServiceOrderStatus.IN_EXECUTION,
      );
      expect(result).toHaveProperty('status', EstimateStatus.APPROVED);
    });

    it('should handle non-approved status without transitioning OS', async () => {
      const mockEstimate = {
        id: 'est-1',
        serviceOrderId: 'order-1',
        status: EstimateStatus.REJECTED,
        totalAmount: 150,
        validUntil: null,
        approvedAt: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      } as any;
      repository.updateEstimateStatus.mockResolvedValue(mockEstimate);

      const result = await useCase.updateEstimateStatus('est-1', {
        status: EstimateStatus.REJECTED,
      });

      expect(repository.updateStatus).not.toHaveBeenCalled();
      expect(result).toHaveProperty('status', EstimateStatus.REJECTED);
    });

    it('should throw if service order not found after approve', async () => {
      const mockEstimate = {
        id: 'est-1',
        serviceOrderId: 'order-1',
        status: EstimateStatus.APPROVED,
        totalAmount: 150,
        validUntil: null,
        approvedAt: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      } as any;
      repository.updateEstimateStatus.mockResolvedValue(mockEstimate);
      repository.findById.mockResolvedValue(null);

      await expect(
        useCase.updateEstimateStatus('est-1', {
          status: EstimateStatus.APPROVED,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when order status is invalid for approve', async () => {
      const mockEstimate = {
        id: 'est-1',
        serviceOrderId: 'order-1',
        status: EstimateStatus.APPROVED,
        totalAmount: 150,
        validUntil: null,
        approvedAt: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      } as any;
      repository.updateEstimateStatus.mockResolvedValue(mockEstimate);
      repository.findById.mockResolvedValue({
        ...mockOrder,
        status: ServiceOrderStatus.RECEIVED,
      });

      await expect(
        useCase.updateEstimateStatus('est-1', {
          status: EstimateStatus.APPROVED,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('rejectEstimate', () => {
    it('should move to DELIVERED with reason', async () => {
      const order = {
        ...mockOrder,
        status: ServiceOrderStatus.WAITING_APPROVAL,
      };
      repository.findById.mockResolvedValue(order);
      repository.updateStatus.mockResolvedValue({
        ...order,
        status: ServiceOrderStatus.DELIVERED,
      });
      repository.createStatusHistory.mockResolvedValue({} as any);

      await useCase.rejectEstimate('order-1', {
        reason: 'Too expensive',
      });

      expect(repository.updateStatus).toHaveBeenCalledWith(
        'order-1',
        ServiceOrderStatus.DELIVERED,
      );
      expect(repository.createStatusHistory).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Too expensive' }),
      );
    });

    it('should throw if order not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(
        useCase.rejectEstimate('invalid', { reason: 'No reason' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when status is not WAITING_APPROVAL', async () => {
      repository.findById.mockResolvedValue({
        ...mockOrder,
        status: ServiceOrderStatus.RECEIVED,
      });
      await expect(
        useCase.rejectEstimate('order-1', { reason: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
