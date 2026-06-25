import { Test, TestingModule } from '@nestjs/testing';
import { MechanicUseCase } from './mechanic.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';

describe('MechanicUseCase', () => {
  let useCase: MechanicUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;

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
        MechanicUseCase,
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(MechanicUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
  });

  describe('assignMechanic', () => {
    it('should assign mechanic', async () => {
      // TODO: Descomente quando access-identity module estiver pronto
      // userRepository.findById.mockResolvedValue({
      //   id: 'user-1',
      //   name: 'John',
      //   role: UserRole.MECHANIC,
      // });
      repository.findById.mockResolvedValue(mockOrder);
      repository.update.mockResolvedValue({
        ...mockOrder,
        mechanicId: 'user-1',
      });

      const result = await useCase.assignMechanic('order-1', {
        mechanicId: 'user-1',
      });

      expect(repository.update).toHaveBeenCalledWith(
        'order-1',
        expect.objectContaining({ mechanicId: 'user-1' }),
      );
      expect(result).toBeDefined();
    });

    it('should throw if order not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(
        useCase.assignMechanic('invalid', { mechanicId: 'user-1' }),
      ).rejects.toThrow(ServiceOrderNotFoundException);
    });
  });
});
