import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesService } from './vehicles.service';
import { PrismaService } from '@/prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    vehicle: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    client: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if vehicle plate already exists', async () => {
      mockPrismaService.vehicle.findUnique.mockResolvedValue({
        id: '1',
        plate: 'ABC-1234',
      });
      await expect(
        service.create({
          plate: 'ABC-1234',
          model: 'Fusca',
          brand: 'VW',
          year: 1970,
          clientId: '1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if client does not exist', async () => {
      mockPrismaService.vehicle.findUnique.mockResolvedValue(null);
      mockPrismaService.client.findUnique.mockResolvedValue(null);
      await expect(
        service.create({
          plate: 'ABC-1234',
          model: 'Fusca',
          brand: 'VW',
          year: 1970,
          clientId: '1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create a new vehicle successfully', async () => {
      mockPrismaService.vehicle.findUnique.mockResolvedValue(null);
      mockPrismaService.client.findUnique.mockResolvedValue({
        id: '1',
        name: 'Test Client',
      });
      mockPrismaService.vehicle.create.mockResolvedValue({
        id: '1',
        plate: 'ABC-1234',
      });

      const result = await service.create({
        plate: 'ABC-1234',
        model: 'Fusca',
        brand: 'VW',
        year: 1970,
        clientId: '1',
      });
      expect(result).toEqual({ id: '1', plate: 'ABC-1234' });
    });
  });

  describe('findAll', () => {
    it('should return an array of vehicles', async () => {
      const result = [{ id: '1', plate: 'ABC-1234' }];
      mockPrismaService.vehicle.findMany.mockResolvedValue(result);
      expect(await service.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if vehicle is not found', async () => {
      mockPrismaService.vehicle.findUnique.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('should return a vehicle if found', async () => {
      const vehicle = { id: '1', plate: 'ABC-1234' };
      mockPrismaService.vehicle.findUnique.mockResolvedValue(vehicle);
      expect(await service.findOne('1')).toEqual(vehicle);
    });
  });

  describe('update', () => {
    it('should update a vehicle successfully', async () => {
      const vehicle = { id: '1', plate: 'ABC-1234' };
      mockPrismaService.vehicle.findUnique.mockResolvedValue(vehicle);
      mockPrismaService.vehicle.update.mockResolvedValue({
        ...vehicle,
        plate: 'XYZ-9876',
      });

      const result = await service.update('1', { plate: 'XYZ-9876' });
      expect(result.plate).toEqual('XYZ-9876');
    });
  });

  describe('remove', () => {
    it('should delete a vehicle successfully', async () => {
      const vehicle = { id: '1', plate: 'ABC-1234' };
      mockPrismaService.vehicle.findUnique.mockResolvedValue(vehicle);
      mockPrismaService.vehicle.delete.mockResolvedValue(vehicle);

      const result = await service.remove('1');
      expect(result).toEqual(vehicle);
    });
  });
});
