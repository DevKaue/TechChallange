import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderUseCase } from './service-order.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import {
  ClientRepository,
  CLIENT_REPOSITORY,
} from '@service-orders/domain/acls/client-repository.interface';
import {
  VehicleRepository,
  VEHICLE_REPOSITORY,
} from '@service-orders/domain/acls/vehicle-repository.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ServiceOrderUseCase', () => {
  let useCase: ServiceOrderUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;
  let vehicleRepository: jest.Mocked<VehicleRepository>;

  const mockOrder: any = {
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

  const mockVehicle = {
    id: 'vehicle-1',
    plate: 'ABC-123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    clientId: 'client-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrderUseCase,
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            updateStatus: jest.fn(),
            setClosedAt: jest.fn(),
            createStatusHistory: jest.fn(),
          },
        },
        {
          provide: CLIENT_REPOSITORY,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: VEHICLE_REPOSITORY,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(ServiceOrderUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
    vehicleRepository = module.get(VEHICLE_REPOSITORY);
  });

  describe('create', () => {
    it('should create a service order', async () => {
      vehicleRepository.findById.mockResolvedValue(mockVehicle);
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
      vehicleRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.create({ clientId: 'client-1', vehicleId: 'invalid' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if vehicle belongs to another client', async () => {
      vehicleRepository.findById.mockResolvedValue({
        id: 'v1',
        plate: 'XYZ-999',
        brand: 'Honda',
        model: 'Civic',
        year: 2021,
        clientId: 'other-client',
      });

      await expect(
        useCase.create({ clientId: 'client-1', vehicleId: 'v1' }),
      ).rejects.toThrow(BadRequestException);
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
        BadRequestException,
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
        BadRequestException,
      );
    });

    it('should throw if order not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(useCase.finish('invalid', 'user-1')).rejects.toThrow(
        NotFoundException,
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
});
