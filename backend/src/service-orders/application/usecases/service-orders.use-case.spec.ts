import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrdersUseCase } from './service-orders.use-case';
import { ServiceOrdersRepositoryInterface } from '../../domain/contracts/service-orders-repository.interface';
import { ServiceOrderStatus, EstimateStatus } from '@prisma/client';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

describe('ServiceOrdersUseCase', () => {
  let useCase: ServiceOrdersUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;

  const mockOrder = {
    id: 'order-1',
    clientId: 'client-1',
    vehicleId: 'vehicle-1',
    status: ServiceOrderStatus.RECEIVED,
    mileage: null,
    notes: null,
    mechanicId: null,
    closedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    client: {
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
      clientId: 'client-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    mechanic: null,
    estimates: [],
    statusHistory: [],
  };

  const mockVehicle = { id: 'vehicle-1', clientId: 'client-1' };
  const mockUser = { id: 'user-1', name: 'Joao', role: 'MECHANIC' as const };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrdersUseCase,
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findVehicleById: jest.fn(),
            findUserById: jest.fn(),
            findServiceCatalogById: jest.fn(),
            findPartById: jest.fn(),
            updateStatus: jest.fn(),
            assignMechanic: jest.fn(),
            setClosedAt: jest.fn(),
            createStatusHistory: jest.fn(),
            createEstimate: jest.fn(),
            addEstimateItem: jest.fn(),
            updateEstimateStatus: jest.fn(),
            updatePartStock: jest.fn(),
            updateMechanicAvailability: jest.fn(),
            findExecutionTimes: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(ServiceOrdersUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
  });

  describe('create', () => {
    it('should create a service order', async () => {
      repository.findVehicleById.mockResolvedValue(mockVehicle);
      repository.create.mockResolvedValue(mockOrder);
      repository.createStatusHistory.mockResolvedValue({} as any);

      const result = await useCase.create({
        clientId: 'client-1',
        vehicleId: 'vehicle-1',
      });

      expect(repository.create).toHaveBeenCalledWith({
        clientId: 'client-1',
        vehicleId: 'vehicle-1',
        status: ServiceOrderStatus.RECEIVED,
      });
      expect(result).toHaveProperty('id', 'order-1');
    });

    it('should throw if vehicle not found', async () => {
      repository.findVehicleById.mockResolvedValue(null);

      await expect(
        useCase.create({ clientId: 'client-1', vehicleId: 'invalid' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if vehicle belongs to another client', async () => {
      repository.findVehicleById.mockResolvedValue({
        id: 'v1',
        clientId: 'other-client',
      });

      await expect(
        useCase.create({ clientId: 'client-1', vehicleId: 'v1' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      repository.findAll.mockResolvedValue([mockOrder]);
      const result = await useCase.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 'order-1');
    });
  });

  describe('findOne', () => {
    it('should return the order', async () => {
      repository.findById.mockResolvedValue(mockOrder);

      const result = await useCase.findOne('order-1');
      expect(result).toHaveProperty('id', 'order-1');
    });

    it('should throw if not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(useCase.findOne('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assignMechanic', () => {
    it('should assign a mechanic', async () => {
      repository.findById.mockResolvedValue(mockOrder);
      repository.findUserById.mockResolvedValue(mockUser);
      repository.assignMechanic.mockResolvedValue(mockOrder);

      const result = await useCase.assignMechanic('order-1', {
        mechanicId: 'user-1',
      });

      expect(repository.assignMechanic).toHaveBeenCalledWith(
        'order-1',
        'user-1',
      );
      expect(result).toHaveProperty('id', 'order-1');
    });

    it('should throw if user is not a mechanic', async () => {
      repository.findById.mockResolvedValue(mockOrder);
      repository.findUserById.mockResolvedValue({
        id: 'u1',
        name: 'Ana',
        role: 'ATTENDANT',
      });

      await expect(
        useCase.assignMechanic('order-1', { mechanicId: 'u1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if user not found', async () => {
      repository.findById.mockResolvedValue(mockOrder);
      repository.findUserById.mockResolvedValue(null);

      await expect(
        useCase.assignMechanic('order-1', { mechanicId: 'invalid' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if order not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        useCase.assignMechanic('invalid', { mechanicId: 'user-1' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('startDiagnosis', () => {
    it('should move to IN_DIAGNOSIS', async () => {
      repository.findById.mockResolvedValue(mockOrder);
      repository.updateStatus.mockResolvedValue({
        ...mockOrder,
        status: ServiceOrderStatus.IN_DIAGNOSIS,
      });
      repository.createStatusHistory.mockResolvedValue({} as any);

      const result = await useCase.startDiagnosis('order-1', {
        diagnosis: 'Checking engine',
      });

      expect(repository.updateStatus).toHaveBeenCalledWith(
        'order-1',
        ServiceOrderStatus.IN_DIAGNOSIS,
      );
      expect(result).toBeDefined();
    });

    it('should throw if order not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        useCase.startDiagnosis('invalid', { diagnosis: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
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
      repository.findServiceCatalogById.mockResolvedValue({
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
        itemType: 'SERVICE' as any,
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
      repository.findPartById.mockResolvedValue({
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
        itemType: 'PART' as any,
        referenceId: 'part-1',
        quantity: 2,
      });

      expect(repository.updatePartStock).toHaveBeenCalledWith('part-1', 2);
      expect(repository.addEstimateItem).toHaveBeenCalledWith(
        expect.objectContaining({ unitPrice: 45, totalPrice: 90 }),
      );
      expect(result).toHaveProperty('id', 'item-2');
    });

    it('should throw if service not found in catalog', async () => {
      repository.findServiceCatalogById.mockResolvedValue(null);

      await expect(
        useCase.addEstimateItem('est-1', {
          itemType: 'SERVICE' as any,
          referenceId: 'invalid',
          quantity: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if part stock is insufficient', async () => {
      repository.findPartById.mockResolvedValue({
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
      repository.findPartById.mockResolvedValue(null);

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
      };
      repository.updateEstimateStatus.mockResolvedValue(mockEstimate as any);

      const waitingApproval = {
        ...mockOrder,
        status: ServiceOrderStatus.WAITING_APPROVAL,
      };
      repository.findById.mockResolvedValue(waitingApproval);
      repository.updateStatus.mockResolvedValue({
        ...waitingApproval,
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
      };
      repository.updateEstimateStatus.mockResolvedValue(mockEstimate as any);

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
      };
      repository.updateEstimateStatus.mockResolvedValue(mockEstimate as any);
      repository.findById.mockResolvedValue(null);

      await expect(
        useCase.updateEstimateStatus('est-1', {
          status: EstimateStatus.APPROVED,
        }),
      ).rejects.toThrow(NotFoundException);
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

      const result = await useCase.rejectEstimate('order-1', {
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
  });

  describe('startService', () => {
    it('should move from WAITING_APPROVAL to IN_EXECUTION', async () => {
      const waitingApproval = {
        ...mockOrder,
        status: ServiceOrderStatus.WAITING_APPROVAL,
      };
      repository.findById.mockResolvedValue(waitingApproval);
      repository.updateStatus.mockResolvedValue({
        ...waitingApproval,
        status: ServiceOrderStatus.IN_EXECUTION,
      });
      repository.createStatusHistory.mockResolvedValue({} as any);

      const result = await useCase.startService('order-1');

      expect(repository.updateStatus).toHaveBeenCalledWith(
        'order-1',
        ServiceOrderStatus.IN_EXECUTION,
      );
      expect(result).toBeDefined();
    });

    it('should throw if status is not WAITING_APPROVAL', async () => {
      repository.findById.mockResolvedValue(mockOrder);

      await expect(useCase.startService('order-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if order not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(useCase.startService('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('finish', () => {
    it('should move from IN_EXECUTION to FINISHED', async () => {
      const inExecution = {
        ...mockOrder,
        status: ServiceOrderStatus.IN_EXECUTION,
        mechanicId: 'user-1',
      };
      repository.findById.mockResolvedValue(inExecution);
      repository.updateStatus.mockResolvedValue({
        ...inExecution,
        status: ServiceOrderStatus.FINISHED,
      });
      repository.createStatusHistory.mockResolvedValue({} as any);

      await useCase.finish('order-1', 'user-1');

      expect(repository.updateStatus).toHaveBeenCalledWith(
        'order-1',
        ServiceOrderStatus.FINISHED,
      );
    });

    it('should pass notes to status history', async () => {
      const inExecution = {
        ...mockOrder,
        status: ServiceOrderStatus.IN_EXECUTION,
        mechanicId: 'user-1',
      };
      repository.findById.mockResolvedValue(inExecution);
      repository.updateStatus.mockResolvedValue({
        ...inExecution,
        status: ServiceOrderStatus.FINISHED,
      });
      repository.createStatusHistory.mockResolvedValue({} as any);

      await useCase.finish('order-1', 'user-1', 'Completed all repairs');

      expect(repository.createStatusHistory).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Completed all repairs' }),
      );
    });

    it('should throw if not the assigned mechanic', async () => {
      const inExecution = {
        ...mockOrder,
        status: ServiceOrderStatus.IN_EXECUTION,
        mechanicId: 'mechanic-A',
      };
      repository.findById.mockResolvedValue(inExecution);

      await expect(useCase.finish('order-1', 'mechanic-B')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw if no mechanic assigned', async () => {
      const inExecution = {
        ...mockOrder,
        status: ServiceOrderStatus.IN_EXECUTION,
        mechanicId: null,
      };
      repository.findById.mockResolvedValue(inExecution);

      await expect(useCase.finish('order-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw if order not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(useCase.finish('invalid', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateMechanicAvailability', () => {
    it('should update mechanic availability', async () => {
      repository.updateMechanicAvailability.mockResolvedValue(undefined);

      await useCase.updateMechanicAvailability('user-1', false);

      expect(repository.updateMechanicAvailability).toHaveBeenCalledWith(
        'user-1',
        false,
      );
    });
  });

  describe('deliverVehicle', () => {
    it('should move from FINISHED to DELIVERED', async () => {
      const finished = { ...mockOrder, status: ServiceOrderStatus.FINISHED };
      repository.findById.mockResolvedValue(finished);
      repository.updateStatus.mockResolvedValue({
        ...finished,
        status: ServiceOrderStatus.DELIVERED,
      });
      repository.createStatusHistory.mockResolvedValue({} as any);

      await useCase.deliverVehicle('order-1');

      expect(repository.updateStatus).toHaveBeenCalledWith(
        'order-1',
        ServiceOrderStatus.DELIVERED,
      );
    });

    it('should throw if order not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(useCase.deliverVehicle('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('close', () => {
    it('should move from DELIVERED to CLOSED', async () => {
      const delivered = { ...mockOrder, status: ServiceOrderStatus.DELIVERED };
      repository.findById.mockResolvedValue(delivered);
      repository.updateStatus.mockResolvedValue({
        ...delivered,
        status: ServiceOrderStatus.CLOSED,
      });
      repository.setClosedAt.mockResolvedValue({} as any);
      repository.createStatusHistory.mockResolvedValue({} as any);

      await useCase.close('order-1');

      expect(repository.updateStatus).toHaveBeenCalledWith(
        'order-1',
        ServiceOrderStatus.CLOSED,
      );
      expect(repository.setClosedAt).toHaveBeenCalled();
    });

    it('should throw if order not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(useCase.close('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAverageExecutionTime', () => {
    it('should return 0 when no orders', async () => {
      repository.findExecutionTimes.mockResolvedValue([]);

      const result = await useCase.getAverageExecutionTime();

      expect(result.totalOrdersAnalyzed).toBe(0);
    });

    it('should calculate average', async () => {
      const now = Date.now();
      repository.findExecutionTimes.mockResolvedValue([
        { startTime: new Date(now - 120000), endTime: new Date(now) },
        { startTime: new Date(now - 60000), endTime: new Date(now) },
      ]);

      const result = await useCase.getAverageExecutionTime();

      expect(result.totalOrdersAnalyzed).toBe(2);
      expect(result.averageExecutionTimeMinutes).toBeGreaterThan(0);
    });
  });
});
