import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrdersService } from './service-orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ServiceOrderStatus } from '@prisma/client';

describe('ServiceOrdersService', () => {
  let service: ServiceOrdersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    vehicle: { findUnique: jest.fn() },
    serviceOrder: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    serviceCatalog: { findUnique: jest.fn() },
    part: { findUnique: jest.fn(), update: jest.fn() },
    serviceOrderItem: { create: jest.fn() },
    serviceOrderPart: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ServiceOrdersService>(ServiceOrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if vehicle not found', async () => {
      mockPrismaService.vehicle.findUnique.mockResolvedValue(null);
      await expect(service.create({ clientId: '1', vehicleId: '2' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if vehicle does not belong to client', async () => {
      mockPrismaService.vehicle.findUnique.mockResolvedValue({ clientId: 'different-client' });
      await expect(service.create({ clientId: '1', vehicleId: '2' })).rejects.toThrow(ConflictException);
    });

    it('should create a service order successfully', async () => {
      mockPrismaService.vehicle.findUnique.mockResolvedValue({ clientId: '1' });
      mockPrismaService.serviceOrder.create.mockResolvedValue({ id: 'so-1', status: ServiceOrderStatus.RECEIVED });
      
      const result = await service.create({ clientId: '1', vehicleId: '2' });
      expect(result).toEqual({ id: 'so-1', status: ServiceOrderStatus.RECEIVED });
    });
  });

  describe('generateBudget', () => {
    it('should calculate budget correctly', async () => {
      const mockOrder = {
        id: 'so-1',
        services: [{ priceAtTime: 100, quantity: 2 }],
        parts: [{ priceAtTime: 50, quantity: 4 }],
      };
      
      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder as any);
      mockPrismaService.serviceOrder.update.mockResolvedValue({ id: 'so-1', totalPrice: 400, status: ServiceOrderStatus.WAITING_APPROVAL });
      
      const result = await service.generateBudget('so-1');
      
      expect(result.totalPrice).toBe(400);
      expect(mockPrismaService.serviceOrder.update).toHaveBeenCalledWith({
        where: { id: 'so-1' },
        data: { totalPrice: 400, status: ServiceOrderStatus.WAITING_APPROVAL },
      });
    });
  });

  describe('updateStatus', () => {
    it('should set startedExecutionAt when status changes to IN_PROGRESS', async () => {
      const mockOrder = { id: 'so-1', status: ServiceOrderStatus.RECEIVED, startedExecutionAt: null };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder as any);
      mockPrismaService.serviceOrder.update.mockResolvedValue({
        id: 'so-1',
        status: ServiceOrderStatus.IN_PROGRESS,
        startedExecutionAt: new Date(),
      });

      const result = await service.updateStatus('so-1', { status: ServiceOrderStatus.IN_PROGRESS });
      expect(mockPrismaService.serviceOrder.update).toHaveBeenCalledWith({
        where: { id: 'so-1' },
        data: {
          status: ServiceOrderStatus.IN_PROGRESS,
          startedExecutionAt: expect.any(Date),
        },
      });
    });

    it('should set finishedExecutionAt when status changes to FINISHED', async () => {
      const mockOrder = { id: 'so-1', status: ServiceOrderStatus.IN_PROGRESS, startedExecutionAt: new Date(), finishedExecutionAt: null };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder as any);
      mockPrismaService.serviceOrder.update.mockResolvedValue({
        id: 'so-1',
        status: ServiceOrderStatus.FINISHED,
        finishedExecutionAt: new Date(),
      });

      const result = await service.updateStatus('so-1', { status: ServiceOrderStatus.FINISHED });
      expect(mockPrismaService.serviceOrder.update).toHaveBeenCalledWith({
        where: { id: 'so-1' },
        data: {
          status: ServiceOrderStatus.FINISHED,
          finishedExecutionAt: expect.any(Date),
        },
      });
    });
  });

  describe('getAverageExecutionTime', () => {
    it('should return 0 minutes when no orders are found', async () => {
      mockPrismaService.serviceOrder.findMany.mockResolvedValue([]);
      const result = await service.getAverageExecutionTime();
      expect(result).toEqual({
        averageExecutionTimeMinutes: 0,
        totalOrdersAnalyzed: 0,
        message: expect.any(String),
      });
    });

    it('should calculate the average execution time correctly', async () => {
      const start1 = new Date('2026-05-25T10:00:00Z');
      const end1 = new Date('2026-05-25T10:30:00Z'); // 30 minutes
      const start2 = new Date('2026-05-25T12:00:00Z');
      const end2 = new Date('2026-05-25T13:00:00Z'); // 60 minutes

      mockPrismaService.serviceOrder.findMany.mockResolvedValue([
        { startedExecutionAt: start1, finishedExecutionAt: end1 },
        { startedExecutionAt: start2, finishedExecutionAt: end2 },
      ]);

      const result = await service.getAverageExecutionTime();
      expect(result).toEqual({
        averageExecutionTimeMinutes: 45, // (30 + 60) / 2
        totalOrdersAnalyzed: 2,
      });
    });
  });

  describe('findAll', () => {
    it('should return a list of service orders', async () => {
      mockPrismaService.serviceOrder.findMany.mockResolvedValue([{ id: 'so-1' }]);
      const result = await service.findAll();
      expect(result).toEqual([{ id: 'so-1' }]);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should return service order if found', async () => {
      const mockOrder = { id: 'so-1' };
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(mockOrder);
      const result = await service.findOne('so-1');
      expect(result).toEqual(mockOrder);
    });
  });

  describe('addService', () => {
    it('should throw BadRequestException if order status is not RECEIVED or IN_DIAGNOSTICS', async () => {
      const mockOrder = { id: 'so-1', status: ServiceOrderStatus.WAITING_APPROVAL };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder as any);
      await expect(service.addService('so-1', { itemId: 'serv-1', quantity: 1 })).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if service not in catalog', async () => {
      const mockOrder = { id: 'so-1', status: ServiceOrderStatus.IN_DIAGNOSTICS };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder as any);
      mockPrismaService.serviceCatalog.findUnique.mockResolvedValue(null);
      await expect(service.addService('so-1', { itemId: 'serv-1', quantity: 1 })).rejects.toThrow(NotFoundException);
    });

    it('should add service successfully', async () => {
      const mockOrder = { id: 'so-1', status: ServiceOrderStatus.IN_DIAGNOSTICS };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder as any);
      mockPrismaService.serviceCatalog.findUnique.mockResolvedValue({ id: 'serv-1', price: 150 });
      mockPrismaService.serviceOrderItem.create.mockResolvedValue({ id: 'item-1' });

      const result = await service.addService('so-1', { itemId: 'serv-1', quantity: 2 });
      expect(result).toEqual({ id: 'item-1' });
      expect(mockPrismaService.serviceOrderItem.create).toHaveBeenCalledWith({
        data: {
          serviceOrderId: 'so-1',
          serviceCatalogId: 'serv-1',
          quantity: 2,
          priceAtTime: 150,
        },
      });
    });
  });

  describe('addPart', () => {
    it('should throw BadRequestException if order status is not RECEIVED or IN_DIAGNOSTICS', async () => {
      const mockOrder = { id: 'so-1', status: ServiceOrderStatus.WAITING_APPROVAL };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder as any);
      await expect(service.addPart('so-1', { itemId: 'part-1', quantity: 1 })).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if part not found', async () => {
      const mockOrder = { id: 'so-1', status: ServiceOrderStatus.IN_DIAGNOSTICS };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder as any);
      mockPrismaService.part.findUnique.mockResolvedValue(null);
      await expect(service.addPart('so-1', { itemId: 'part-1', quantity: 1 })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if stock is insufficient', async () => {
      const mockOrder = { id: 'so-1', status: ServiceOrderStatus.IN_DIAGNOSTICS };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder as any);
      mockPrismaService.part.findUnique.mockResolvedValue({ id: 'part-1', name: 'Filter', stockQuantity: 2 });
      await expect(service.addPart('so-1', { itemId: 'part-1', quantity: 5 })).rejects.toThrow(ConflictException);
    });

    it('should add part successfully and decrement stock', async () => {
      const mockOrder = { id: 'so-1', status: ServiceOrderStatus.IN_DIAGNOSTICS };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder as any);
      mockPrismaService.part.findUnique.mockResolvedValue({ id: 'part-1', name: 'Filter', stockQuantity: 10, price: 45 });
      mockPrismaService.serviceOrderPart.create.mockResolvedValue({ id: 'sop-1' });

      const result = await service.addPart('so-1', { itemId: 'part-1', quantity: 2 });
      expect(result).toEqual({ id: 'sop-1' });
      expect(mockPrismaService.part.update).toHaveBeenCalledWith({
        where: { id: 'part-1' },
        data: { stockQuantity: { decrement: 2 } },
      });
      expect(mockPrismaService.serviceOrderPart.create).toHaveBeenCalledWith({
        data: {
          serviceOrderId: 'so-1',
          partId: 'part-1',
          quantity: 2,
          priceAtTime: 45,
        },
      });
    });
  });
});

