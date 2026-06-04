import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrdersUseCase } from './service-orders.use-case';
import { ServiceOrdersRepositoryInterface } from './service-orders-repository.interface';
import { ServiceOrderStatus, EstimateStatus } from '@prisma/client';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

describe('ServiceOrdersUseCase', () => {
  let useCase: ServiceOrdersUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;

  const mockOrder = {
    id: 'order-1',
    clientId: 'client-1',
    vehicleId: 'vehicle-1',
    status: ServiceOrderStatus.RECEIVED as string,
    mileage: null,
    notes: null,
    dataFechamento: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    client: {
      id: 'client-1',
      name: 'John',
      cpfCnpj: '123',
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
    mecanico: null,
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
        role: 'RECEPTIONIST' as const,
      });

      await expect(
        useCase.assignMechanic('order-1', { mechanicId: 'u1' }),
      ).rejects.toThrow(BadRequestException);
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
  });

  describe('createEstimate', () => {
    it('should create estimate and move to WAITING_APPROVAL', async () => {
      const orderInDiagnosis = {
        ...mockOrder,
        status: ServiceOrderStatus.IN_DIAGNOSIS,
      };
      repository.findById.mockResolvedValue(orderInDiagnosis);
      repository.createEstimate.mockResolvedValue({
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
      });
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
  });

  describe('finish', () => {
    it('should move from IN_EXECUTION to FINISHED', async () => {
      const inExecution = {
        ...mockOrder,
        status: ServiceOrderStatus.IN_EXECUTION,
      };
      repository.findById.mockResolvedValue(inExecution);
      repository.updateStatus.mockResolvedValue({
        ...inExecution,
        status: ServiceOrderStatus.FINISHED,
      });
      repository.createStatusHistory.mockResolvedValue({} as any);

      await useCase.finish('order-1');

      expect(repository.updateStatus).toHaveBeenCalledWith(
        'order-1',
        ServiceOrderStatus.FINISHED,
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
