import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '@/prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ClientsService', () => {
  let service: ClientsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    client: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if client already exists', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue({
        id: '1',
        document: '52998224725',
        documentType: 'CPF',
      });
      await expect(
        service.create({
          name: 'Test',
          document: '52998224725',
          documentType: 'CPF' as any,
          email: 'test@test.com',
          phone: '123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a new client successfully', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);
      mockPrismaService.client.create.mockResolvedValue({
        id: '1',
        name: 'Test',
        document: '52998224725',
        documentType: 'CPF',
      });

      const result = await service.create({
        name: 'Test',
        document: '52998224725',
        documentType: 'CPF' as any,
        email: 'test@test.com',
        phone: '123',
      });
      expect(result).toEqual({
        id: '1',
        name: 'Test',
        document: '52998224725',
        documentType: 'CPF',
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of clients', async () => {
      const result = [{ id: '1', name: 'Test' }];
      mockPrismaService.client.findMany.mockResolvedValue(result);
      expect(await service.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if client is not found', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('should return a client if found', async () => {
      const client = { id: '1', name: 'Test' };
      mockPrismaService.client.findUnique.mockResolvedValue(client);
      expect(await service.findOne('1')).toEqual(client);
    });
  });

  describe('update', () => {
    it('should update a client successfully', async () => {
      const client = { id: '1', name: 'Test' };
      mockPrismaService.client.findUnique.mockResolvedValue(client);
      mockPrismaService.client.update.mockResolvedValue({
        ...client,
        name: 'Updated',
      });

      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toEqual('Updated');
    });

  });

  describe('remove', () => {
    it('should delete a client successfully', async () => {
      const client = { id: '1', name: 'Test' };
      mockPrismaService.client.findUnique.mockResolvedValue(client);
      mockPrismaService.client.delete.mockResolvedValue(client);

      const result = await service.remove('1');
      expect(result).toEqual(client);
    });
  });
});
