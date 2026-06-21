import { Test, TestingModule } from '@nestjs/testing';
import { MechanicUseCase } from './mechanic.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import {
  UserRepository,
  USER_REPOSITORY,
} from '@service-orders/domain/acls/user-repository.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { UserRole } from '@service-orders/domain/enums/user-role.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MechanicUseCase', () => {
  let useCase: MechanicUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;
  let userRepository: jest.Mocked<UserRepository>;

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

  const mockUser = {
    id: 'user-1',
    name: 'Joao',
    email: 'joao@oficina.com',
    role: UserRole.MECHANIC,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MechanicUseCase,
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findById: jest.fn(),
            assignMechanic: jest.fn(),
          },
        },
        {
          provide: USER_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            updateAvailability: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(MechanicUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
    userRepository = module.get(USER_REPOSITORY);
  });

  describe('assignMechanic', () => {
    it('should assign a mechanic', async () => {
      repository.findById.mockResolvedValue(mockOrder);
      userRepository.findById.mockResolvedValue(mockUser);
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
      userRepository.findById.mockResolvedValue({
        id: 'u1',
        name: 'Ana',
        email: 'ana@oficina.com',
        role: UserRole.ATTENDANT,
      });

      await expect(
        useCase.assignMechanic('order-1', { mechanicId: 'u1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if user not found', async () => {
      repository.findById.mockResolvedValue(mockOrder);
      userRepository.findById.mockResolvedValue(null);

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

  describe('updateMechanicAvailability', () => {
    it('should update mechanic availability', async () => {
      userRepository.updateAvailability.mockResolvedValue(undefined);

      await useCase.updateMechanicAvailability('user-1', false);

      expect(userRepository.updateAvailability).toHaveBeenCalledWith(
        'user-1',
        false,
      );
    });
  });
});
