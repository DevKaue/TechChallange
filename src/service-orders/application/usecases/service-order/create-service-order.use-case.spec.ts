import { Test, TestingModule } from '@nestjs/testing';
import { CreateServiceOrderUseCase } from './create-service-order.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import CustomerManagementInterface from '@/common/contracts/customer-management.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { CustomerNotFoundException } from '@service-orders/application/exceptions/customer-not-found.exception';
import { VehicleNotFoundException } from '@service-orders/application/exceptions/vehicle-not-found.exception';
import { VehicleOwnerMismatchException } from '@service-orders/application/exceptions/vehicle-owner-mismatch.exception';

describe('CreateServiceOrderUseCase', () => {
  let useCase: CreateServiceOrderUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;
  let customerManagement: jest.Mocked<CustomerManagementInterface>;

  const mockOrder: any = {
    id: 'order-1',
    customerId: 'client-1',
    vehicleId: 'vehicle-1',
    status: ServiceOrderStatus.RECEIVED,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CreateServiceOrderUseCase,
          useFactory: (
            repository: ServiceOrdersRepositoryInterface,
            customerManagement: CustomerManagementInterface,
          ) => new CreateServiceOrderUseCase(repository, customerManagement),
          inject: [ServiceOrdersRepositoryInterface, CustomerManagementInterface],
        },
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            create: jest.fn(),
            createStatusHistory: jest.fn(),
          },
        },
        {
          provide: CustomerManagementInterface,
          useValue: {
            findCustomerById: jest.fn(),
            findVehicleById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(CreateServiceOrderUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
    customerManagement = module.get(CustomerManagementInterface);
  });

  it('should create a service order when the vehicle belongs to the client', async () => {
    customerManagement.findCustomerById.mockResolvedValue({
      id: 'client-1',
      document: '123',
    } as any);
    customerManagement.findVehicleById.mockResolvedValue({
      id: 'vehicle-1',
      customerId: 'client-1',
    } as any);
    repository.create.mockResolvedValue(mockOrder);
    repository.createStatusHistory.mockResolvedValue({} as any);

    const result = await useCase.execute({
      customerId: 'client-1',
      vehicleId: 'vehicle-1',
    });

    expect(repository.create).toHaveBeenCalledWith({
      customerId: 'client-1',
      vehicleId: 'vehicle-1',
      status: ServiceOrderStatus.RECEIVED,
    });
    expect(result).toHaveProperty('id', 'order-1');
  });

  it('should throw when the vehicle does not exist', async () => {
    customerManagement.findCustomerById.mockResolvedValue({ id: 'client-1' } as any);
    customerManagement.findVehicleById.mockResolvedValue(null);

    await expect(
      useCase.execute({ customerId: 'client-1', vehicleId: 'x' }),
    ).rejects.toThrow(VehicleNotFoundException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw when the customer does not exist', async () => {
    customerManagement.findCustomerById.mockResolvedValue(null);

    await expect(
      useCase.execute({ customerId: 'no-client', vehicleId: 'vehicle-1' }),
    ).rejects.toThrow(CustomerNotFoundException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw when the vehicle does not belong to the client', async () => {
    customerManagement.findCustomerById.mockResolvedValue({ id: 'client-1' } as any);
    customerManagement.findVehicleById.mockResolvedValue({
      id: 'vehicle-1',
      customerId: 'another-client',
    } as any);

    await expect(
      useCase.execute({ customerId: 'client-1', vehicleId: 'vehicle-1' }),
    ).rejects.toThrow(VehicleOwnerMismatchException);
    expect(repository.create).not.toHaveBeenCalled();
  });
});